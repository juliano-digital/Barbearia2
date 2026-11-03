import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';

export const Equipe = () => {
  const { content } = usePageContent('equipe');
  const members = Array.isArray(content?.members) ? content.members : [];

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />
      <main className="py-16 px-6 container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Profissionais de Elite
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            {content?.equipe_title}
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base md:text-lg">{content?.equipe_subtitle}</p>
        </div>

        {members.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {members.map((member) => (
              <article key={member.id || member.nome} className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-6 text-center hover:border-[#d4af37] transition-all shadow-xl flex flex-col justify-between">
                <div>
                  {member.foto ? (
                    <img src={member.foto} alt={member.nome || ''} className="w-24 h-24 object-cover rounded-full mx-auto mb-6 border-2 border-[#d4af37]" />
                  ) : (
                    <div className="w-24 h-24 bg-[#2b170e] rounded-full mx-auto mb-6 border-2 border-[#d4af37] flex items-center justify-center text-3xl font-bold text-[#d4af37]">
                      {member.nome?.charAt(0)}
                    </div>
                  )}
                  <h2 className="font-bold text-xl text-[#f3e5ab] mb-2" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{member.nome}</h2>
                  {member.cargo && <p className="text-sm text-[#d4af37] font-medium mb-1">{member.cargo}</p>}
                  {member.bio && <p className="text-xs text-gray-400 mb-6">{member.bio}</p>}
                </div>
                <Link to="/agendamento" className="block w-full py-2.5 rounded-lg bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] hover:opacity-90 transition-all font-black text-xs uppercase tracking-wider border border-[#5a371c] shadow-md">
                  Agendar
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mb-16">Nenhum membro cadastrado.</p>
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
