import { Link } from 'react-router-dom';
import { Home as HomeIcon, Info, Scissors, DollarSign, Users, Image, Phone, CalendarDays, Mail } from 'lucide-react';

const sections = [
  { to: '/admin/home', label: 'Home', icon: HomeIcon, desc: 'Textos do topo e rodapé' },
  { to: '/admin/sobre', label: 'Sobre', icon: Info, desc: 'História e apresentação' },
  { to: '/admin/servicos', label: 'Serviços', icon: Scissors, desc: 'Lista de serviços oferecidos' },
  { to: '/admin/precos', label: 'Preços', icon: DollarSign, desc: 'Tabela de valores' },
  { to: '/admin/equipe', label: 'Equipe', icon: Users, desc: 'Barbeiros e especialidades' },
  { to: '/admin/galeria', label: 'Galeria', icon: Image, desc: 'Fotos do ambiente e cortes' },
  { to: '/admin/contato', label: 'Contato', icon: Phone, desc: 'Endereço, telefone e horários' },
  { to: '/admin/agendamentos', label: 'Agendamentos', icon: CalendarDays, desc: 'Solicitações recebidas pelo site' },
  { to: '/admin/mensagens', label: 'Mensagens', icon: Mail, desc: 'Mensagens recebidas pelo formulário' },
];

export const AdminDashboard = () => (
  <div className="p-6">
    <h1 className="text-lg font-medium mb-6">Painel de administração</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map(({ to, label, icon: Icon, desc }) => (
        <Link
          key={to}
          to={to}
          className="border border-black rounded-lg p-4 flex flex-col gap-2 hover:bg-black hover:text-white transition-colors group"
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-gray-500 group-hover:text-gray-300">{desc}</span>
        </Link>
      ))}
    </div>
  </div>
);