import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { clearDemoAccess } from '../lib/demoAccess';

export const AdminRoute = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const session = sessionData?.session;

        if (!session) {
          if (active) setStatus('denied');
          return;
        }

        const { data: userRow, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (error) throw error;

        if (userRow?.role === 'admin') clearDemoAccess();
        if (active) setStatus(userRow?.role === 'admin' ? 'allowed' : 'denied');
      } catch (error) {
        console.error('Erro ao verificar permissão administrativa:', error);
        if (active) setStatus('denied');
      }
    };

    checkAdmin();
    const { data: listener } = supabase.auth.onAuthStateChange(() => checkAdmin());
    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (status === 'checking') {
    return <div className="flex items-center justify-center min-h-screen bg-white text-black text-sm">Verificando permissão...</div>;
  }

  return status === 'allowed' ? <Outlet /> : <Navigate to="/admin/login" replace />;
};