import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';

export const Servicos = () => {
  const { content } = usePageContent('servicos');
  const services = Array.isArray(content?.items) ? content.items : [];

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />
      <main className="py-16 px-6 container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Excelência & Tradição
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            {content?.servicos_title}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg">{content?.servicos_subtitle}</p>
        </div>

        {services.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((service) => (
              <article key={service.id || service.nome} className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 hover:border-[#d4af37] transition-all shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5d78e] via-[#d4af37] to-[#9c752b] flex items-center justify-center text-[#1a0f08] mb-6 shadow-md">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-[#d4af37]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{service.nome}</h2>
                  {service.descricao && <p className="text-gray-300 leading-relaxed mb-6">{service.descricao}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-6">
                    {service.duracao && <span>{service.duracao}</span>}
                    {service.preco && <span>{service.preco}</span>}
                  </div>
                </div>
                <Link to="/agendamento" className="block w-full py-3 text-center rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-xs border border-[#5a371c] hover:opacity-90 transition-all shadow-md">
                  Agendar Serviço
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mb-16">Nenhum serviço cadastrado.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};
