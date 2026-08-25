import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, ClipboardCheck, History, Eye, Menu } from 'lucide-react';
import { subscribeRecentIncidents } from '@/services/api/firestore';
import './BottomNav.css';

interface BottomNavProps {
  onOpenDrawer: () => void;
}

const BottomNav = ({ onOpenDrawer }: BottomNavProps) => {
  const { hasRole, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openIncidentCount, setOpenIncidentCount] = useState(0);
  const [hasTodayAttendance, setHasTodayAttendance] = useState(false);

  useEffect(() => {
    if (!hasRole('supervisor')) return;
    const unsub = subscribeRecentIncidents(50, (incidents) => {
      const open = incidents.filter((i) => i.estado !== 'resuelto').length;
      setOpenIncidentCount(open);
    });
    return unsub;
  }, [hasRole]);

  useEffect(() => {
    if (hasRole('supervisor') || !profile?.escuelaId) return;
    let unmounted = false;
    import('@/services/api/firestore').then(({ getTodayAttendancesBySchool }) => {
      getTodayAttendancesBySchool(profile.escuelaId).then((data) => {
        if (!unmounted) setHasTodayAttendance(data.length > 0);
      });
    });
    return () => { unmounted = true; };
  }, [hasRole, profile?.escuelaId]);

  const items: Array<{
    icon: React.ReactNode;
    label: string;
    to?: string;
    active?: boolean;
    isMore?: boolean;
    onClick?: () => void;
    badge?: number;
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
      badge: openIncidentCount || undefined,
    });
  }

  items.push({
    icon: <Menu size={22} strokeWidth={1.8} />,
    label: 'Más',
    isMore: true,
    onClick: onOpenDrawer,
  });

  const activeIndex = items.findIndex((item) => item.active);

  return (
    <nav className="bottom-nav">
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="bottom-nav__indicator"
          style={{
            width: `${100 / items.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      )}
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
            onClick={() => navigate(item.to!, { viewTransition: true })}
            aria-label={item.label}
          >
            {item.icon}
            {item.badge != null && item.badge > 0 && (
              <span className="bottom-nav__badge">{item.badge > 99 ? '99+' : item.badge}</span>
            )}
            {!hasRole('supervisor') && item.to === '/asistencia' && !hasTodayAttendance && (
              <span className="bottom-nav__dot" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
