import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearDemoAccess } from '../lib/demoAccess';
import { supabase } from '../services/supabaseClient';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      if (error) throw error;

      clearDemoAccess();
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao entrar na conta:', error);
      toast.error(`Não foi possível entrar: ${error.message || 'erro inesperado.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1920&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      <div className="relative z-10 w-full max-w-md p-6 bg-[#161616]/25 backdrop-blur-sm border border-white/10 shadow-2xl rounded-2xl text-white">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-2 w-16 h-16 rounded-full overflow-hidden border border-neutral-700 bg-[#222] flex items-center justify-center shadow-md">
            <img src="/logo/download.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <img src="/Img/escritalogo.png" alt="Barbershop" className="w-[85%] h-auto object-contain my-3" />
          <h2 className="mt-2 text-lg font-bold text-gray-100">Entrar na sua conta</h2>
          <p className="mt-2 text-center text-sm text-amber-300">
            Dados de acesso teste@gmail.com, Senha: 123456
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-email" className="block mb-1 text-sm font-medium text-neutral-300">E-mail</label>
            <input
              id="user-email"
              type="email"
              autoComplete="username"
              required
              placeholder="teste@gmail.com"
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              className="w-full p-3 bg-[#222]/40 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <div>
            <label htmlFor="user-password" className="block mb-1 text-sm font-medium text-neutral-300">Senha</label>
            <input
              id="user-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="123456"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              className="w-full p-3 bg-[#222]/40 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/recuperar-senha" className="text-sm text-amber-400 hover:text-amber-300">Esqueci minha senha</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-500 hover:to-amber-600 transition duration-200 font-bold uppercase tracking-wider text-sm shadow-lg disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-300">
          Ainda não tem conta? <Link to="/cadastro" className="text-amber-400 hover:text-amber-300">Cadastre-se</Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link to="/admin/login" className="text-neutral-400 hover:text-white">Acesso administrativo</Link>
        </p>
      </div>
    </div>
  );
};
