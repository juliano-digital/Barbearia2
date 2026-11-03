import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';
import { BottomNavBar } from './BottomNavBar';
import { supabase } from '../../services/supabaseClient';
import { usePageContent } from '../../hooks/usePageContent';

export const Navbar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();
  const { content: site } = usePageContent('site');

  useEffect(() => {
    // Verifica a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    // Escuta mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    } else {
      navigate('/login');
      setMenuAberto(false); // Fecha o menu mobile após o logout
    }
  };

  const navItems = [
    { to: '/', label: 'Início' },
    { to: '/servicos', label: 'Serviços' },
    { to: '/precos', label: 'Preços' },
    { to: '/galeria', label: 'Galeria' },
    { to: '/sobre', label: 'Sobre Nós' },
    { to: '/equipe', label: 'Equipe' },
    { to: '/contato', label: 'Contato' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full navbar-wood border-y-4 border-[#5a371c] shadow-[0_6px_25px_rgba(0,0,0,0.85)] relative">
      {/* Parafusos metálicos nos cantos do painel de madeira */}
      <div className="absolute top-1.5 left-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 hidden md:flex items-center justify-center text-[8px] font-bold text-[#3a220d]">✚</div>
      <div className="absolute bottom-1.5 left-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 hidden md:flex items-center justify-center text-[8px] font-bold text-[#3a220d]">✚</div>
      <div className="absolute top-1.5 right-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 hidden md:flex items-center justify-center text-[8px] font-bold text-[#3a220d]">✚</div>
      <div className="absolute bottom-1.5 right-2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 hidden md:flex items-center justify-center text-[8px] font-bold text-[#3a220d]">✚</div>

      <div className="max-w-7xl mx-auto flex items-center justify-between py-2 md:py-3 px-4 sm:px-6 md:px-8">
        
        {/* Logo Estilo Vintage */}
        <Link to="/" className="flex flex-col items-center group text-center">
          <img src="/Img/escritalogo.png" alt="Barbershop" className="h-14 md:h-20 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
          <span className="sr-only">Barbershop</span>
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            {site?.brand}
          </span>
        </Link>

        {/* Menu Desktop e Botões Agendar/Entrar agrupados próximos à palavra Contato */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5 ml-2">
          <div className="flex items-center gap-3 xl:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative text-[#f3e5ab] font-bold tracking-wider uppercase text-xs xl:text-sm hover:text-[#ffd700] transition-colors duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
                  after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-[#ffd700] after:to-transparent
                  after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[#5a371c]/50">
            {!loadingAuth && session ? (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a0f08]/60 text-[#d4af37] font-bold uppercase tracking-wider text-xs border border-[#d4af37]/40 hover:bg-[#1a0f08] transition-colors whitespace-nowrap"
                title="Sair da conta">
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg bg-[#1a0f08]/60 text-[#d4af37] font-bold uppercase tracking-wider text-xs border border-[#d4af37]/40 hover:bg-[#1a0f08] transition-colors whitespace-nowrap"
                title="Entrar / Conta">
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Botões para telas MD (tablet) */}
        <div className="hidden md:flex lg:hidden items-center gap-2 ml-4">
          <Link
            to="/agendamento"
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-xs
              border-2 border-[#5a371c] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_8px_rgba(0,0,0,0.7)]
              hover:from-[#ffe8a3] hover:to-[#b5882e] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
              flex items-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1a0f08]" strokeWidth={2.5} />
            Agendar Horário
          </Link>
          {!loadingAuth && session ? (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a0f08]/60 text-[#d4af37] font-bold uppercase tracking-wider text-xs border border-[#d4af37]/40 hover:bg-[#1a0f08] transition-colors whitespace-nowrap"
              title="Sair da conta"
            >
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              className="px-2.5 py-1.5 rounded-lg bg-[#1a0f08]/60 text-[#d4af37] font-bold uppercase tracking-wider text-xs border border-[#d4af37]/40 hover:bg-[#1a0f08] transition-colors whitespace-nowrap"
              title="Entrar / Conta"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Botão menu mobile */}
        <button
          className="md:hidden text-[#d4af37] p-2 rounded-lg bg-[#1a0f08]/50 border border-[#8b5a2b]/50"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
        >
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {menuAberto && (
        <div className="md:hidden flex flex-col items-center gap-4 py-6 bg-gradient-to-b from-[#22130c] to-[#140a06] border-t-2 border-[#5a371c] shadow-2xl animate-fadeIn">
          {navItems
            .filter(item => item.label === 'Equipe' || item.label === 'Sobre Nós')
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuAberto(false)}
                className="text-[#f3e5ab] font-bold uppercase tracking-widest text-sm hover:text-[#ffd700] transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
          <div className="flex flex-col gap-3 w-4/5 max-w-xs mt-2 pt-4 border-t border-[#5a371c]">
            <Link
              to="/agendamento"
              onClick={() => setMenuAberto(false)}
              className="w-full text-center px-4 py-2 rounded-lg bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-xs border-2 border-[#5a371c] shadow-md flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Agendar Horário
            </Link>
            {!loadingAuth && session ? (
              <button
                onClick={handleLogout}
                className="w-full text-center px-5 py-2.5 rounded-lg bg-[#1a0f08] text-[#d4af37] font-bold uppercase tracking-wider text-sm border border-[#d4af37]/50"
              >
                Sair da Conta
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuAberto(false)}
                className="w-full text-center px-5 py-2.5 rounded-lg bg-[#1a0f08] text-[#d4af37] font-bold uppercase tracking-wider text-sm border border-[#d4af37]/50"
              >
                Entrar / Conta
              </Link>
            )}
          </div>
        </div>
      )}
      <BottomNavBar />

    </nav>
  );
};