import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';

export const Galeria = () => {
  const { content } = usePageContent('galeria');
  const photos = Array.isArray(content?.photos) ? content.photos : [];

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />
      <main className="py-16 px-6 container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Nosso Espaço & Arte
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            Galeria de Fotos
          </h1>
        </div>

        {photos.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {photos.map((photo) => (
              <figure key={photo.id || photo.url} className="h-80 rounded-2xl bg-[#1b100b] border-2 border-[#5a371c] shadow-xl overflow-hidden relative">
                <img src={photo.url} alt={photo.legenda || ''} className="w-full h-full object-cover" />
                {photo.legenda && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-6 left-4 right-4 z-10 bg-[#1a0f08]/90 border border-[#d4af37]/50 px-5 py-2.5 rounded-xl text-[#d4af37] font-bold text-sm tracking-wider uppercase text-center">
                      {photo.legenda}
                    </figcaption>
                  </>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mb-16">Nenhuma foto cadastrada.</p>
        )}

        <div className="text-center">
          <Link to="/agendamento" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-base border-2 border-[#5a371c] shadow-lg hover:scale-105 transition-all">
            <Calendar className="w-5 h-5" />
            Agende Seu Horário
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
