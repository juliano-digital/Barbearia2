import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Upload } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { getPageContent, savePageContent } from '../../services/siteContentService';
import { uploadImage, deleteImage } from '../../services/imageUploadService';
import { DEFAULT_CAROUSEL_IMAGES } from '../../lib/carouselImages';

const emptyHome = { hero_badge: '', hero_title: '', hero_subtitle: '', carousel_images: DEFAULT_CAROUSEL_IMAGES };
const emptySite = { brand: '', address: '', phone: '', instagram: '', working_hours: '', copyright: '' };

export const AdminHome = () => {
  const [home, setHome] = useState(emptyHome);
  const [site, setSite] = useState(emptySite);
  const [loading, setLoading] = useState(true);
  const [savingHome, setSavingHome] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [pendingCarouselDeletes, setPendingCarouselDeletes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [homeData, siteData] = await Promise.all([getPageContent('home'), getPageContent('site')]);
        if (homeData) setHome((prev) => ({ ...prev, ...homeData }));
        if (siteData) setSite((prev) => ({ ...prev, ...siteData }));
      } catch (error) {
        console.error('Erro ao carregar conteúdo da Home:', error);
        toast.error(`Erro ao carregar conteúdo: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveHome = async () => {
    setSavingHome(true);
    try {
      await savePageContent('home', home);
    } catch (error) {
      console.error('Erro ao salvar conteúdo da Home:', error);
      toast.error(`Erro ao salvar conteúdo: ${error.message}`);
      setSavingHome(false);
      return;
    }

    try {
      await Promise.all(pendingCarouselDeletes.map(deleteImage));
      setPendingCarouselDeletes([]);
      toast.success('Conteúdo da Home salvo');
    } catch (error) {
      console.error('Home salva, mas uma imagem antiga do carrossel não foi removida:', error);
      toast.error(`Conteúdo salvo, mas não foi possível limpar uma imagem antiga: ${error.message}`);
    } finally {
      setSavingHome(false);
    }
  };

  const handleCarouselUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingCarousel(true);
    try {
      for (const file of files) {
        const url = await uploadImage(file, 'carrossel');
        setHome((current) => ({ ...current, carousel_images: [...current.carousel_images, url] }));
      }
      toast.success(`${files.length} imagem(ns) adicionada(s) ao carrossel`);
    } catch (error) {
      console.error('Erro ao enviar imagem do carrossel:', error);
      toast.error(`Erro ao enviar imagem: ${error.message}`);
    } finally {
      setUploadingCarousel(false);
      event.target.value = '';
    }
  };

  const handleCarouselRemove = (index) => {
    const image = home.carousel_images[index];
    if (image) setPendingCarouselDeletes((current) => [...new Set([...current, image])]);
    setHome((current) => ({
      ...current,
      carousel_images: current.carousel_images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSaveSite = async () => {
    setSavingSite(true);
    try {
      await savePageContent('site', site);
      toast.success('Informações do site salvas');
    } catch (error) {
      console.error('Erro ao salvar informações do site:', error);
      toast.error(`Erro ao salvar conteúdo: ${error.message}`);
    } finally {
      setSavingSite(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Editando: Home" siteUrl="/" />
        <div className="p-6 text-sm text-gray-500">Carregando...</div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Editando: Home" siteUrl="/" />
      <div className="p-6 flex flex-col gap-10 max-w-2xl">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Seção hero (topo da página)</h2>

          <div>
            <label className="block text-xs mb-1.5">Selo / badge</label>
            <input type="text" value={home.hero_badge} onChange={(e) => setHome({ ...home, hero_badge: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Título principal</label>
            <input type="text" value={home.hero_title} onChange={(e) => setHome({ ...home, hero_title: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Subtítulo</label>
            <textarea rows={2} value={home.hero_subtitle} onChange={(e) => setHome({ ...home, hero_subtitle: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveHome} disabled={savingHome}
              className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
              {savingHome ? 'Salvando...' : 'Salvar seção hero'}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-black pt-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Imagens do carrossel</h2>
            <p className="mt-1 text-xs text-gray-500">As imagens aparecem na página inicial na ordem exibida abaixo.</p>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-black px-4 py-6 text-sm hover:bg-gray-50">
            <Upload size={16} />
            {uploadingCarousel ? 'Enviando imagens...' : 'Carregar imagens'}
            <input type="file" accept="image/*" multiple onChange={handleCarouselUpload}
              disabled={uploadingCarousel || savingHome} className="hidden" />
          </label>

          {home.carousel_images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {home.carousel_images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative overflow-hidden rounded-md border border-black">
                  <img src={image} alt={`Imagem ${index + 1} do carrossel`} className="h-28 w-full bg-gray-100 object-contain" />
                  <span className="block border-t border-black px-2 py-1 text-xs">Imagem {index + 1}</span>
                  <button type="button" onClick={() => handleCarouselRemove(index)} disabled={savingHome || uploadingCarousel}
                    className="absolute right-1.5 top-1.5 rounded-full border border-black bg-white p-1 text-gray-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                    aria-label={`Remover imagem ${index + 1} do carrossel`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma imagem no carrossel.</p>
          )}

          <div className="flex justify-end">
            <button onClick={handleSaveHome} disabled={savingHome || uploadingCarousel}
              className="rounded-md border border-black bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
              {savingHome ? 'Salvando...' : 'Salvar carrossel'}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-black pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Informações do site (rodapé, contato)</h2>

          <div>
            <label className="block text-xs mb-1.5">Nome da marca</label>
            <input type="text" value={site.brand} onChange={(e) => setSite({ ...site, brand: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Endereço</label>
            <input type="text" value={site.address} onChange={(e) => setSite({ ...site, address: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5">Telefone / WhatsApp</label>
              <input type="text" value={site.phone} onChange={(e) => setSite({ ...site, phone: e.target.value })}
                className="w-full border border-black rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1.5">Instagram</label>
              <input type="text" value={site.instagram} onChange={(e) => setSite({ ...site, instagram: e.target.value })}
                className="w-full border border-black rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5">Horário de funcionamento</label>
            <input type="text" value={site.working_hours} onChange={(e) => setSite({ ...site, working_hours: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs mb-1.5">Texto de copyright</label>
            <input type="text" value={site.copyright} onChange={(e) => setSite({ ...site, copyright: e.target.value })}
              className="w-full border border-black rounded-md px-3 py-2 text-sm" />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveSite} disabled={savingSite}
              className="border border-black bg-black text-white rounded-md px-4 py-2 text-sm disabled:opacity-50">
              {savingSite ? 'Salvando...' : 'Salvar informações do site'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
};