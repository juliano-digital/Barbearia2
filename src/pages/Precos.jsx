import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';

export const Precos = () => {
  const { content } = usePageContent('precos');
  const plans = Array.isArray(content?.plans) ? content.plans : [];

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />
      <main className="py-16 px-6 container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Investimento em Você
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            {content?.precos_title}
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base md:text-lg">{content?.precos_subtitle}</p>
        </div>

        {plans.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {plans.map((plan) => (
              <article key={plan.id || plan.nome} className={`bg-[#1b100b] border-2 p-6 rounded-2xl transition-all shadow-xl flex justify-between items-center gap-4 ${
                plan.destaque
                  ? 'border-[#d4af37] shadow-[0_0_24px_rgba(212,175,55,0.25)]'
                  : 'border-[#5a371c] hover:border-[#d4af37]'
              }`}>
                <div>
                  {plan.destaque && (
                    <span className="inline-block mb-2 px-3 py-1 rounded-full bg-[#d4af37] text-[#1a0f08] text-[10px] font-black uppercase tracking-wider">
                      Mais popular
                    </span>
                  )}
                  <h2 className="font-bold text-lg text-[#f3e5ab] mb-1">{plan.nome}</h2>
                  {plan.descricao && <p className="text-xs text-gray-400">{plan.descricao}</p>}
                </div>
                {plan.preco && <span className="text-2xl font-black text-[#d4af37] whitespace-nowrap">{plan.preco}</span>}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mb-12">Nenhum preço cadastrado.</p>
        )}

        <div className="text-center">
          <Link to="/agendamento" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-base border-2 border-[#5a371c] shadow-lg hover:scale-105 transition-all">
            <Calendar className="w-5 h-5" />
            Agendar Horário Agora
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
