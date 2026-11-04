import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearDemoAccess } from '../lib/demoAccess';
import { supabase } from '../services/supabaseClient';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      if (authError) throw authError;

      const { data: userRow, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || userRow?.role !== 'admin') {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        if (profileError?.code === 'PGRST116') {
          throw new Error(
            'A conta existe no Supabase Auth, mas ainda não possui perfil em public.users. No SQL Editor, crie o perfil e defina role = admin para este e-mail.'
          );
        }
        if (profileError) throw profileError;
        throw new Error('Esta conta não possui acesso administrativo.');
      }

      clearDemoAccess();
      toast.success('Login administrativo realizado!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao entrar no painel administrativo:', error);
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
          <h2 className="mt-2 text-lg font-bold text-gray-100">Entrar no painel administrativo</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block mb-1 text-sm font-medium text-neutral-300">E-mail</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              className="w-full p-3 bg-[#222]/40 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block mb-1 text-sm font-medium text-neutral-300">Senha</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              className="w-full p-3 bg-[#222]/40 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-500 hover:to-amber-600 transition duration-200 font-bold uppercase tracking-wider text-sm shadow-lg disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar como administrador'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          <Link to="/login" className="text-neutral-300 hover:text-white">Voltar ao login de usuário</Link>
        </p>
      </div>
    </div>
  );
};
