import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export const PrivateRoute = () => {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#161616] text-white text-sm">
        Carregando...
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
};