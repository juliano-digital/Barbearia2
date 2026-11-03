import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Upload } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';
import { uploadImage, deleteImage } from '../../services/imageUploadService';

export const AdminGaleria = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPageContent('galeria');
        if (data && Array.isArray(data.photos)) setPhotos(data.photos);
      } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const url = await uploadImage(file, 'galeria');
        uploaded.push({ id: crypto.randomUUID(), url, legenda: '' });
      }
      setPhotos((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} foto(s) enviada(s)`);
    } catch (error) {
      console.error('Erro ao enviar fotos da galeria:', error);
      toast.error(`Erro ao enviar fotos: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const updateLegenda = (id, value) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, legenda: value } : p)));
  };

  const removePhoto = async (id) => {
    const photo = photos.find((p) => p.id === id);
    if (photo?.url) setPendingDeletes((prev) => [...new Set([...prev, photo.url])]);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePageContent('galeria', { photos });
    } catch (error) {
      console.error('Erro ao salvar galeria:', error);
      toast.error(`Erro ao salvar galeria: ${error.message}`);
      setSaving(false);
      return;
    }

    try {
      await Promise.all(pendingDeletes.map(deleteImage));
      setPendingDeletes([]);
      toast.success('Galeria salva');
    } catch (error) {
      console.error('Galeria salva, mas uma foto removida não foi excluída do armazenamento:', error);
      toast.error(`Galeria salva, mas não foi possível limpar uma foto antiga: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Galeria" siteUrl="/galeria" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Galeria" siteUrl="/galeria" />
      <div className="p-6 flex flex-col gap-6 max-w-3xl">
        <label className="flex items-center justify-center gap-2 border border-dashed border-black rounded-md px-4 py-6 text-sm cursor-pointer hover:bg-gray-50">
          <Upload size={16} />
          {uploading ? 'Enviando...' : 'Clique para adicionar fotos'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border border-black rounded-md overflow-hidden flex flex-col">
              <div className="relative">
                <img src={photo.url} alt={photo.legenda || 'Foto'} className="w-full h-32 object-cover" />
                <button onClick={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 bg-white border border-black rounded-full p-1 hover:bg-red-600 hover:text-white hover:border-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
              <input type="text" placeholder="Legenda (opcional)" value={photo.legenda}
                onChange={(e) => updateLegenda(photo.id, e.target.value)}
                className="px-2 py-1.5 text-xs border-t border-black outline-none" />
            </div>
          ))}
        </div>

        {photos.length === 0 && <p className="text-sm text-gray-500">Nenhuma foto adicionada ainda.</p>}

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar galeria'}
          </button>
        </div>
      </div>
    </>
  );
};