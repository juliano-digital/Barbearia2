import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';

const emptyItem = () => ({ id: crypto.randomUUID(), nome: '', descricao: '', preco: '', duracao: '' });

export const AdminServicos = () => {
  const [intro, setIntro] = useState({ servicos_title: '', servicos_subtitle: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('servicos');
        if (data) {
          setIntro({ servicos_title: data.servicos_title || '', servicos_subtitle: data.servicos_subtitle || '' });
          setItems(Array.isArray(data.items) && data.items.length ? data.items : [emptyItem()]);
        } else {
          setItems([emptyItem()]);
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanItems = items.filter((it) => it.nome.trim() !== '');
      await savePageContent('servicos', { ...intro, items: cleanItems });
      setItems(cleanItems.length ? cleanItems : [emptyItem()]);
      toast.success('Serviços salvos');
    } catch (error) {
      console.error('Erro ao salvar serviços:', error);
      toast.error(`Erro ao salvar serviços: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Serviços" siteUrl="/servicos" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Serviços" siteUrl="/servicos" />
      <div className="p-6 flex flex-col gap-8 max-w-3xl">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Introdução da página</h2>
          <div>
            <label className="block text-xs mb-1.5">Título</label>
            <input type="text" value={intro.servicos_title} onChange={(e) => setIntro({ ...intro, servicos_title: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Subtítulo</label>
            <input type="text" value={intro.servicos_subtitle} onChange={(e) => setIntro({ ...intro, servicos_subtitle: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-black pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Lista de serviços</h2>
            <button onClick={addItem} className="flex items-center gap-1.5 text-xs border border-black rounded-md px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
              <Plus size={14} /> Adicionar serviço
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border border-black rounded-md p-4 flex flex-col gap-3 relative">
                <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600" title="Remover">
                  <Trash2 size={16} />
                </button>
                <span className="text-xs text-gray-400">Item {idx + 1}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5">Nome do serviço</label>
                    <input type="text" value={item.nome} onChange={(e) => updateItem(item.id, 'nome', e.target.value)}
                      className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5">Duração</label>
                    <input type="text" placeholder="ex: 30 min" value={item.duracao} onChange={(e) => updateItem(item.id, 'duracao', e.target.value)}
                      className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5">Descrição</label>
                  <input type="text" value={item.descricao} onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                    className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1.5">Preço</label>
                  <input type="text" placeholder="ex: R$ 45,00" value={item.preco} onChange={(e) => updateItem(item.id, 'preco', e.target.value)}
                    className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar serviços'}
          </button>
        </div>
      </div>
    </>
  );
};