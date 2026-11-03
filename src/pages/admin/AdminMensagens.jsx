import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { deleteContactMessage, getContactMessages } from '../../services/contactMessageService';

const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export const AdminMensagens = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setMessages(await getContactMessages());
    } catch (loadError) {
      console.error('Erro ao carregar mensagens de contato:', loadError);
      setError(loadError.message || 'Falha inesperada ao consultar mensagens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleDelete = async (message) => {
    if (!window.confirm(`Deseja excluir a mensagem recebida de ${message.nome}?`)) return;

    setDeletingId(message.id);
    try {
      await deleteContactMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      toast.success('Mensagem excluída');
    } catch (deleteError) {
      console.error('Erro ao excluir mensagem de contato:', deleteError);
      toast.error(`Não foi possível excluir a mensagem: ${deleteError.message || 'erro inesperado.'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedSearch) return messages;
    return messages.filter((message) =>
      `${message.nome} ${message.email}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    );
  }, [messages, search]);

  return (
    <>
      <AdminPageHeader title="Mensagens" siteUrl="/contato" />
      <main className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between mb-6">
          <label className="text-xs text-gray-600">
            Buscar por nome ou e-mail
            <span className="relative block mt-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-80 border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm" placeholder="Nome ou e-mail" />
            </span>
          </label>
          <button onClick={loadMessages} disabled={loading} className="inline-flex items-center gap-2 border border-black rounded-md px-3 py-2 text-sm hover:bg-black hover:text-white disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <p role="status" className="text-sm text-gray-500">Carregando mensagens...</p>
        ) : error ? (
          <div role="alert" className="border border-red-300 bg-red-50 rounded-md p-4 text-sm text-red-800">
            <p>Não foi possível carregar as mensagens: {error}</p>
            <button onClick={loadMessages} className="underline mt-2">Tentar novamente</button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <p className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-500">
            {search ? 'Nenhuma mensagem corresponde à busca.' : 'Nenhuma mensagem recebida.'}
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <article key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h2 className="font-semibold">{message.nome}</h2>
                    <a className="text-sm text-blue-700 hover:underline" href={`mailto:${message.email}`}>{message.email}</a>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <time className="text-xs text-gray-500" dateTime={message.created_at}>{formatDate(message.created_at)}</time>
                    <button type="button" onClick={() => handleDelete(message)} disabled={deletingId === message.id}
                      className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                      aria-label={`Excluir mensagem de ${message.nome}`}>
                      <Trash2 size={14} />
                      {deletingId === message.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Ler mensagem</summary>
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words">{message.mensagem}</p>
                </details>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
};
