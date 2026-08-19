import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  ClipboardCheck,
  History,
  Eye,
  Menu,
} from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  onOpenDrawer: () => void;
}

const BottomNav = ({ onOpenDrawer }: BottomNavProps) => {
  const { hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items: Array<{
    icon: React.ReactNode;
    label: string;
    to?: string;
    active?: boolean;
    isMore?: boolean;
    onClick?: () => void;
  }> = [];

  items.push({
    icon: <Home size={22} strokeWidth={1.8} />,
    label: 'Inicio',
    to: '/',
    active: location.pathname === '/',
  });

  if (hasRole('director', 'vice', 'preceptor')) {
    items.push({
      icon: <ClipboardCheck size={22} strokeWidth={1.8} />,
      label: 'Asistencia',
      to: '/asistencia',
      active: location.pathname.startsWith('/asistencia'),
    });
    items.push({
      icon: <History size={22} strokeWidth={1.8} />,
      label: 'Historial',
      to: '/historial',
      active: location.pathname.startsWith('/historial'),
    });
  }

  if (hasRole('supervisor')) {
    items.push({
      icon: <Eye size={22} strokeWidth={1.8} />,
      label: 'Supervisión',
      to: '/supervisor',
      active: location.pathname.startsWith('/supervisor'),
    });
  }

  items.push({
    icon: <Menu size={22} strokeWidth={1.8} />,
    label: 'Más',
    isMore: true,
    onClick: onOpenDrawer,
  });

  return (
    <nav className="bottom-nav">
      {items.map((item, i) => {
        if (item.isMore) {
          return (
            <button
              key="more"
              className="bottom-nav__item bottom-nav__item--more"
              onClick={item.onClick}
              aria-label="Abrir menú"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={i}
            className={`bottom-nav__item ${item.active ? 'bottom-nav__item--active' : ''}`}
            onClick={() => navigate(item.to!)}
            aria-label={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
