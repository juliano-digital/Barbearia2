import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';

const emptyPlan = () => ({ id: crypto.randomUUID(), nome: '', preco: '', descricao: '', destaque: false });

export const AdminPrecos = () => {
  const [intro, setIntro] = useState({ precos_title: '', precos_subtitle: '' });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('precos');
        if (data) {
          setIntro({ precos_title: data.precos_title || '', precos_subtitle: data.precos_subtitle || '' });
          setPlans(Array.isArray(data.plans) && data.plans.length ? data.plans : [emptyPlan()]);
        } else {
          setPlans([emptyPlan()]);
        }
      } catch (error) {
        console.error('Erro ao carregar preços:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updatePlan = (id, field, value) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addPlan = () => setPlans((prev) => [...prev, emptyPlan()]);
  const removePlan = (id) => setPlans((prev) => prev.filter((p) => p.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanPlans = plans.filter((p) => p.nome.trim() !== '');
      await savePageContent('precos', { ...intro, plans: cleanPlans });
      setPlans(cleanPlans.length ? cleanPlans : [emptyPlan()]);
      toast.success('Preços salvos');
    } catch (error) {
      console.error('Erro ao salvar preços:', error);
      toast.error(`Erro ao salvar preços: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Preços" siteUrl="/precos" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Preços" siteUrl="/precos" />
      <div className="p-6 flex flex-col gap-8 max-w-3xl">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Introdução da página</h2>
          <div>
            <label className="block text-xs mb-1.5">Título</label>
            <input type="text" value={intro.precos_title} onChange={(e) => setIntro({ ...intro, precos_title: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Subtítulo</label>
            <input type="text" value={intro.precos_subtitle} onChange={(e) => setIntro({ ...intro, precos_subtitle: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-black pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tabela de valores</h2>
            <button onClick={addPlan} className="flex items-center gap-1.5 text-xs border border-black rounded-md px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
              <Plus size={14} /> Adicionar item
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {plans.map((plan, idx) => (
              <div key={plan.id} className="border border-black rounded-md p-4 flex flex-col gap-3 relative">
                <button onClick={() => removePlan(plan.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600" title="Remover">
                  <Trash2 size={16} />
                </button>
                <span className="text-xs text-gray-400">Item {idx + 1}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5">Nome</label>
                    <input type="text" value={plan.nome} onChange={(e) => updatePlan(plan.id, 'nome', e.target.value)}
                      className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5">Preço</label>
                    <input type="text" placeholder="ex: R$ 45,00" value={plan.preco} onChange={(e) => updatePlan(plan.id, 'preco', e.target.value)}
                      className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5">Descrição</label>
                  <input type="text" value={plan.descricao} onChange={(e) => updatePlan(plan.id, 'descricao', e.target.value)}
                    className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={plan.destaque} onChange={(e) => updatePlan(plan.id, 'destaque', e.target.checked)} />
                  Destacar este item (ex: "mais popular")
                </label>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar tabela de valores'}
          </button>
        </div>
      </div>
    </>
  );
};