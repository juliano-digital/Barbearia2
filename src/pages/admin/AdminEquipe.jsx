import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';
import { uploadImage, deleteImage } from '../../services/imageUploadService';

const emptyMember = () => ({ id: crypto.randomUUID(), nome: '', cargo: '', bio: '', foto: '' });

export const AdminEquipe = () => {
  const [intro, setIntro] = useState({ equipe_title: '', equipe_subtitle: '' });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [pendingDeletes, setPendingDeletes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('equipe');
        if (data) {
          setIntro({ equipe_title: data.equipe_title || '', equipe_subtitle: data.equipe_subtitle || '' });
          setMembers(Array.isArray(data.members) && data.members.length ? data.members : [emptyMember()]);
        } else {
          setMembers([emptyMember()]);
        }
      } catch (error) {
        console.error('Erro ao carregar equipe:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateMember = (id, field, value) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMember = () => setMembers((prev) => [...prev, emptyMember()]);
  const removeMember = (id) => {
    const member = members.find((item) => item.id === id);
    if (member?.foto) setPendingDeletes((prev) => [...new Set([...prev, member.foto])]);
    setMembers((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePhotoChange = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    try {
      const member = members.find((m) => m.id === id);
      const url = await uploadImage(file, 'equipe');
      updateMember(id, 'foto', url);
      if (member?.foto) setPendingDeletes((prev) => [...new Set([...prev, member.foto])]);
    } catch (error) {
      console.error('Erro ao enviar foto da equipe:', error);
      toast.error(`Erro ao enviar foto: ${error.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanMembers = members.filter((m) => m.nome.trim() !== '');
      await savePageContent('equipe', { ...intro, members: cleanMembers });
      setMembers(cleanMembers.length ? cleanMembers : [emptyMember()]);
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error(`Erro ao salvar equipe: ${error.message}`);
      setSaving(false);
      return;
    }

    try {
      await Promise.all(pendingDeletes.map(deleteImage));
      setPendingDeletes([]);
      toast.success('Equipe salva');
    } catch (error) {
      console.error('Equipe salva, mas uma foto antiga não foi removida:', error);
      toast.error(`Equipe salva, mas não foi possível limpar uma foto antiga: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Equipe" siteUrl="/equipe" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Equipe" siteUrl="/equipe" />
      <div className="p-6 flex flex-col gap-8 max-w-3xl">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Introdução da página</h2>
          <div>
            <label className="block text-xs mb-1.5">Título</label>
            <input type="text" value={intro.equipe_title} onChange={(e) => setIntro({ ...intro, equipe_title: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Subtítulo</label>
            <input type="text" value={intro.equipe_subtitle} onChange={(e) => setIntro({ ...intro, equipe_subtitle: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-black pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Membros da equipe</h2>
            <button onClick={addMember} className="flex items-center gap-1.5 text-xs border border-black rounded-md px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
              <Plus size={14} /> Adicionar membro
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {members.map((member, idx) => (
              <div key={member.id} className="border border-black rounded-md p-4 flex gap-4 relative">
                <button onClick={() => removeMember(member.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600" title="Remover">
                  <Trash2 size={16} />
                </button>

                <div className="flex flex-col items-center gap-2 flex-shrink-0 w-24">
                  {member.foto ? (
                    <img src={member.foto} alt={member.nome} className="w-20 h-20 rounded-full object-cover border border-black" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border border-black bg-gray-100" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(member.id, e)}
                    disabled={uploadingId === member.id} className="text-[10px] w-full" />
                  {uploadingId === member.id && <span className="text-[10px] text-gray-500">Enviando...</span>}
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <span className="text-xs text-gray-400">Membro {idx + 1}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1.5">Nome</label>
                      <input type="text" value={member.nome} onChange={(e) => updateMember(member.id, 'nome', e.target.value)}
                        className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5">Cargo / especialidade</label>
                      <input type="text" value={member.cargo} onChange={(e) => updateMember(member.id, 'cargo', e.target.value)}
                        className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5">Bio curta</label>
                    <input type="text" value={member.bio} onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                      className="w-full border border-black rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar equipe'}
          </button>
        </div>
      </div>
    </>
  );
};