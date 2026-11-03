import React from 'react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { Carousel } from '../components/Carousel/Carousel';
import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Calendar, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';

export const Home = () => {
  const { content } = usePageContent('home');

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />

      {/* Hero / Início */}
      <style>{`
        @media (min-width: 768px) {
          #inicio {
            min-height: 85vh;
            justify-content: center !important;
          }
        }
      `}</style>
      <header
        id="inicio"
        className="text-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2d1911] via-[#120a06] to-[#0f0a07] relative overflow-hidden"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '1rem',
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <Carousel images={content?.carousel_images} />
        
        <span className="text-sm md:text-base font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-4" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          {content?.hero_badge}
        </span>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] max-w-4xl" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
          {content?.hero_title}
        </h1>
        
        <p className="text-gray-300 max-w-xl mb-8 text-base md:text-lg">
          {content?.hero_subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            to="/agendamento"
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-base border-2 border-[#5a371c] shadow-[0_6px_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Agendar Agora
          </Link>
          <Link
            to="/servicos"
            className="px-8 py-4 rounded-xl bg-[#1b100b] text-[#d4af37] font-bold uppercase tracking-wider text-base border-2 border-[#5a371c] hover:border-[#d4af37] transition-all flex items-center gap-2"
          >
            Ver Serviços
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Destaques / Atalhos para Páginas */}
      <section className="py-20 px-6 container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Explore Nosso Universo
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Experiência Completa
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">Navegue pelas nossas seções exclusivas e descubra tudo o que oferecemos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link to="/servicos" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Serviços</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Cortes degradê, barba na navalha, toalha quente e combos especiais.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Conhecer serviços <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/precos" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Preços</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Valores justos e transparentes para um serviço de excelência incomparável.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Ver tabela de preços <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/galeria" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Galeria</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Inspire-se com fotos do nosso ambiente rústico e dos melhores cortes executados.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Ver galeria de fotos <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/sobre" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Sobre Nós</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Nossa história de paixão pela barbearia clássica e compromisso com você.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Nossa história <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/equipe" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Equipe</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Conheça nossos mestres barbeiros especializados em visagismo e estilo.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Conhecer barbeiros <ArrowRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/contato" className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] hover:-translate-y-1 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[#d4af37] group-hover:text-[#f9e7b2] transition-colors" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Contato</h3>
            <p className="text-gray-300 leading-relaxed mb-6">Endereço, telefone, WhatsApp e horários de atendimento da barbearia.</p>
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">Fale conosco <ArrowRight className="w-4 h-4" /></span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};