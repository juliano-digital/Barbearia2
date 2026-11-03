import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { deleteAppointment, getAppointments } from '../../services/appointmentService';
import { getPageContent, savePageContent } from '../../services/siteContentService';

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${date}T00:00:00`));
const formatCreatedAt = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
const defaultBookingHeader = {
  agendamento_badge: 'Tradição & Estilo Clássico',
  agendamento_title: 'Agende Seu Horário',
  agendamento_subtitle: 'Cadastre-se na nossa barbearia e garanta seu lugar entre os mestres do estilo. Uma navinha com cara de pirata é a sua recompensa! 🏴‍☠️',
};

export const AdminAgendamentos = () => {
  const [headerContent, setHeaderContent] = useState(defaultBookingHeader);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    getPageContent('agendamento')
      .then((content) => {
        if (active && content) {
          setHeaderContent((current) => ({ ...current, ...content }));
        }
      })
      .catch((loadError) => {
        console.error('Erro ao carregar cabeçalho do agendamento:', loadError);
        toast.error(`Não foi possível carregar o cabeçalho: ${loadError.message || 'erro inesperado.'}`);
      })
      .finally(() => {
        if (active) setHeaderLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      await savePageContent('agendamento', headerContent);
      toast.success('Cabeçalho do agendamento salvo');
    } catch (saveError) {
      console.error('Erro ao salvar cabeçalho do agendamento:', saveError);
      toast.error(`Não foi possível salvar o cabeçalho: ${saveError.message || 'erro inesperado.'}`);
    } finally {
      setSavingHeader(false);
    }
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setAppointments(await getAppointments(dateFilter));
    } catch (loadError) {
      console.error('Erro ao carregar agendamentos:', loadError);
      setError(loadError.message || 'Falha inesperada ao consultar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Deseja excluir o agendamento de ${appointment.nome}?`)) return;

    setDeletingId(appointment.id);
    try {
      await deleteAppointment(appointment.id);
      setAppointments((current) => current.filter((item) => item.id !== appointment.id));
      toast.success('Agendamento excluído');
    } catch (deleteError) {
      console.error('Erro ao excluir agendamento:', deleteError);
      toast.error(`Não foi possível excluir o agendamento: ${deleteError.message || 'erro inesperado.'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedSearch) return appointments;
    return appointments.filter((appointment) =>
      `${appointment.nome} ${appointment.telefone}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    );
  }, [appointments, search]);

  return (
    <>
      <AdminPageHeader title="Agendamentos" siteUrl="/agendamento" />
      <main className="p-6">
        <section className="mb-8 max-w-3xl border-b border-gray-200 pb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Cabeçalho da página de agendamento</h2>
          {headerLoading ? (
            <p role="status" className="text-sm text-gray-500">Carregando cabeçalho...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="booking-badge" className="mb-1.5 block text-xs">Selo / chamada</label>
                <input id="booking-badge" type="text" value={headerContent.agendamento_badge}
                  onChange={(event) => setHeaderContent((current) => ({ ...current, agendamento_badge: event.target.value }))}
                  className="w-full rounded-md border border-black px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="booking-title" className="mb-1.5 block text-xs">Título</label>
                <input id="booking-title" type="text" value={headerContent.agendamento_title}
                  onChange={(event) => setHeaderContent((current) => ({ ...current, agendamento_title: event.target.value }))}
                  className="w-full rounded-md border border-black px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="booking-subtitle" className="mb-1.5 block text-xs">Texto</label>
                <textarea id="booking-subtitle" rows={3} value={headerContent.agendamento_subtitle}
                  onChange={(event) => setHeaderContent((current) => ({ ...current, agendamento_subtitle: event.target.value }))}
                  className="w-full resize-y rounded-md border border-black px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleSaveHeader} disabled={savingHeader}
                  className="rounded-md border border-black bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
                  {savingHeader ? 'Salvando...' : 'Salvar cabeçalho'}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="text-xs text-gray-600">
              Buscar nome ou telefone
              <span className="relative block mt-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm" placeholder="Nome ou telefone" />
              </span>
            </label>
            <label className="text-xs text-gray-600">
              Filtrar data
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="block mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </label>
          </div>
          <button onClick={loadAppointments} disabled={loading} className="inline-flex items-center gap-2 border border-black rounded-md px-3 py-2 text-sm hover:bg-black hover:text-white disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <p role="status" className="text-sm text-gray-500">Carregando agendamentos...</p>
        ) : error ? (
          <div role="alert" className="border border-red-300 bg-red-50 rounded-md p-4 text-sm text-red-800">
            <p>Não foi possível carregar os agendamentos: {error}</p>
            <button onClick={loadAppointments} className="underline mt-2">Tentar novamente</button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <p className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-500">
            {search || dateFilter ? 'Nenhum agendamento corresponde aos filtros.' : 'Nenhum agendamento recebido.'}
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Recebido em</th>
                  <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{appointment.nome}</td>
                    <td className="px-4 py-3">{appointment.telefone}</td>
                    <td className="px-4 py-3">{appointment.servico}</td>
                    <td className="px-4 py-3">{formatDate(appointment.data)}</td>
                    <td className="px-4 py-3">{appointment.horario.slice(0, 5)}</td>
                    <td className="px-4 py-3">{formatCreatedAt(appointment.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => handleDelete(appointment)} disabled={deletingId === appointment.id}
                        className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        aria-label={`Excluir agendamento de ${appointment.nome}`}>
                        <Trash2 size={14} />
                        {deletingId === appointment.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};
