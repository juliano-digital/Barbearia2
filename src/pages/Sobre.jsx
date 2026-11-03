import { Link } from 'react-router-dom';
import { Award, Clock, Users, Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';

export const Sobre = () => {
  const { content } = usePageContent('sobre');

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />
      <main className="py-16 px-6 container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Nossa História & Missão
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            {content?.sobre_title}
          </h1>
        </div>

        <div className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 md:p-12 mb-12 shadow-2xl">
          {content?.sobre_image && (
            <img src={content.sobre_image} alt={content.sobre_title || ''} className="w-full max-h-96 object-cover rounded-xl mb-8" />
          )}
          {content?.sobre_text && <p className="text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-line">{content.sobre_text}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-8 border-t border-[#5a371c]">
            <div className="text-center p-4">
              <Award className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-1 text-[#f3e5ab]">Qualidade Premium</h4>
              <p className="text-xs text-gray-400">Produtos de altíssima qualidade</p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-1 text-[#f3e5ab]">Equipe Especializada</h4>
              <p className="text-xs text-gray-400">Barbeiros mestres na arte</p>
            </div>
            <div className="text-center p-4">
              <Clock className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-1 text-[#f3e5ab]">Tradição & Estilo</h4>
              <p className="text-xs text-gray-400">Ambiente clássico exclusivo</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/agendamento" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-base border-2 border-[#5a371c] shadow-lg hover:scale-105 transition-all">
            <Calendar className="w-5 h-5" />
            Experimente Nossos Serviços
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
