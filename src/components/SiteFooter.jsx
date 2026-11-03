import { usePageContent } from '../hooks/usePageContent';

export const SiteFooter = () => {
  const { content: site } = usePageContent('site');

  return (
    <footer className="py-12 px-6 bg-[#0a0503] border-t-4 border-[#5a371c] text-center text-gray-400">
      <div className="container mx-auto max-w-4xl">
        {site?.brand && (
          <span
            className="text-base font-bold tracking-widest text-[#d4af37] uppercase block mb-2"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {site.brand}
          </span>
        )}
        {site?.address && <p className="mb-2 text-sm">Endereço: {site.address}</p>}
        {site?.phone && <p className="mb-6 text-sm">Telefone / WhatsApp: {site.phone}</p>}
        {(site?.instagram || site?.working_hours) && (
          <div className="flex flex-wrap gap-6 justify-center mb-8 text-sm text-[#f3e5ab]">
            {site.instagram && <span>Instagram: {site.instagram}</span>}
            {site.working_hours && <span>{site.working_hours}</span>}
          </div>
        )}
        {site?.copyright && <p className="text-xs text-gray-600">{site.copyright}</p>}
      </div>
    </footer>
  );
};
