import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { SignUp } from '../pages/SignUp';
import { Login } from '../pages/Login';
import { ForgotPassword } from '../pages/ForgotPassword';
import { Profile } from '../pages/Profile';
import Agendamento from '../pages/Agendamento';
import { BarberDashboard } from '../pages/BarberDashboard';
import { Servicos } from '../pages/Servicos';
import { Precos } from '../pages/Precos';
import { Galeria } from '../pages/Galeria';
import { Sobre } from '../pages/Sobre';
import { Equipe } from '../pages/Equipe';
import { Contato } from '../pages/Contato';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminHome } from '../pages/admin/AdminHome';
import { AdminSobre } from '../pages/admin/AdminSobre';
import { AdminServicos } from '../pages/admin/AdminServicos';
import { AdminPrecos } from '../pages/admin/AdminPrecos';
import { AdminEquipe } from '../pages/admin/AdminEquipe';
import { AdminGaleria } from '../pages/admin/AdminGaleria';
import { AdminContato } from '../pages/admin/AdminContato';
import { AdminAgendamentos } from '../pages/admin/AdminAgendamentos';
import { AdminMensagens } from '../pages/admin/AdminMensagens';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/precos" element={<Precos />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/contato" element={<Contato />} />

        {/* Rotas Protegidas — exige login */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/barber" element={<BarberDashboard />} />
        </Route>

        {/* Painel de administração — só usuário com role admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="sobre" element={<AdminSobre />} />
            <Route path="servicos" element={<AdminServicos />} />
            <Route path="precos" element={<AdminPrecos />} />
            <Route path="equipe" element={<AdminEquipe />} />
            <Route path="galeria" element={<AdminGaleria />} />
            <Route path="contato" element={<AdminContato />} />
            <Route path="agendamentos" element={<AdminAgendamentos />} />
            <Route path="mensagens" element={<AdminMensagens />} />
          </Route>
        </Route>

        {/* Rota Curinga */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};