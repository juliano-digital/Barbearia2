import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';
import { uploadImage, deleteImage } from '../../services/imageUploadService';

const emptySobre = { sobre_title: '', sobre_text: '', sobre_image: '' };

export const AdminSobre = () => {
  const [sobre, setSobre] = useState(emptySobre);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('sobre');
        if (data) setSobre((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error('Erro ao carregar conteúdo Sobre:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const oldUrl = sobre.sobre_image;
      const url = await uploadImage(file, 'sobre');
      setSobre((prev) => ({ ...prev, sobre_image: url }));
      if (oldUrl) setPendingDeletes((prev) => [...new Set([...prev, oldUrl])]);
      toast.success('Imagem enviada');
    } catch (error) {
      console.error('Erro ao enviar imagem da página Sobre:', error);
      toast.error(`Erro ao enviar imagem: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = () => {
    if (sobre.sobre_image) {
      setPendingDeletes((prev) => [...new Set([...prev, sobre.sobre_image])]);
      setSobre((prev) => ({ ...prev, sobre_image: '' }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePageContent('sobre', sobre);
    } catch (error) {
      console.error('Erro ao salvar conteúdo Sobre:', error);
      toast.error(`Erro ao salvar conteúdo: ${error.message}`);
      setSaving(false);
      return;
    }

    try {
      await Promise.all(pendingDeletes.map(deleteImage));
      setPendingDeletes([]);
      toast.success('Conteúdo da página Sobre salvo');
    } catch (error) {
      console.error('Conteúdo Sobre salvo, mas uma imagem antiga não foi removida:', error);
      toast.error(`Conteúdo salvo, mas não foi possível limpar uma imagem antiga: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Sobre" siteUrl="/sobre" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Sobre" siteUrl="/sobre" />
      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        <div>
          <label className="block text-xs mb-1.5">Título da seção</label>
          <input type="text" value={sobre.sobre_title} onChange={(e) => setSobre({ ...sobre, sobre_title: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs mb-1.5">Texto / história</label>
          <textarea rows={6} value={sobre.sobre_text} onChange={(e) => setSobre({ ...sobre, sobre_text: e.target.value })}
            className="w-full border border-black rounded-md px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-xs mb-1.5">Imagem</label>
          {sobre.sobre_image && (
            <div className="mb-2 w-full max-w-xs">
              <img src={sobre.sobre_image} alt="Sobre" className="w-full rounded-md border border-black" />
              <button type="button" onClick={handleImageRemove} disabled={uploading || saving}
                className="mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 disabled:opacity-50">
                <Trash2 size={14} /> Excluir imagem
              </button>
            </div>
          )}
          <label className="inline-flex items-center mt-1 border border-black rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
            {uploading ? 'Enviando...' : 'Carregar imagem'}
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="hidden" />
          </label>
          {uploading && <p className="text-xs text-gray-500 mt-1">Enviando imagem...</p>}
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