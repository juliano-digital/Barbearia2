import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';

const emptyContato = { contato_title: '', contato_subtitle: '', mapa_embed_url: '', whatsapp_mensagem: '' };

export const AdminContato = () => {
  const [contato, setContato] = useState(emptyContato);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('contato');
        if (data) setContato((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error('Erro ao carregar conteúdo de contato:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePageContent('contato', contato);
      toast.success('Conteúdo da página Contato salvo');
    } catch (error) {
      console.error('Erro ao salvar conteúdo de contato:', error);
      toast.error(`Erro ao salvar conteúdo: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Contato" siteUrl="/contato" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Contato" siteUrl="/contato" />
      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        <p className="text-xs text-gray-500 -mt-2">
          Endereço, telefone, Instagram e horário de funcionamento ficam em <strong>Admin → Home</strong>
          (seção "Informações do site"), porque também aparecem no rodapé. Aqui você edita só o conteúdo
          específico da página Contato.
        </p>
        <div>
          <label className="block text-xs mb-1.5">Título da página</label>
          <input type="text" value={contato.contato_title} onChange={(e) => setContato({ ...contato, contato_title: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs mb-1.5">Subtítulo / chamada</label>
          <textarea rows={2} value={contato.contato_subtitle} onChange={(e) => setContato({ ...contato, contato_subtitle: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-xs mb-1.5">URL de destino do Google Maps</label>
          <input type="url" value={contato.mapa_embed_url} onChange={(e) => setContato({ ...contato, mapa_embed_url: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm" placeholder="Cole o link de compartilhamento ou de incorporação do Maps" />
          <p className="mt-1 text-xs text-gray-500">Links de incorporação mostram o mapa aqui; links compartilhados abrem a localização no Google Maps.</p>
        </div>
        <div>
          <label className="block text-xs mb-1.5">Mensagem padrão do botão WhatsApp</label>
          <input type="text" value={contato.whatsapp_mensagem} onChange={(e) => setContato({ ...contato, whatsapp_mensagem: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm" placeholder="Olá! Gostaria de agendar um horário." />
          <p className="mt-1 text-xs text-gray-500">O botão usa o telefone cadastrado em Admin → Home → Informações do site.</p>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </>
  );
};