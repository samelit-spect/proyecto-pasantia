import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, ClipboardCheck, Newspaper } from 'lucide-react';
import {
  subscribeRecentIncidents,
  subscribeTodayAttendances,
  subscribeTodayNews,
} from '@/services/api/firestore';
import { useAuth } from '@/context/AuthContext';
import type { Attendance, News } from '@/types';
import './NotificationBell.css';

interface Notification {
  id: string;
  type: 'incidente' | 'asistencia' | 'novedad';
  title: string;
  subtitle: string;
  to: string;
}

const formatTime = (ts: { toDate: () => Date }) =>
  ts.toDate().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

const formatDate = (ts: { toDate: () => Date }) => ts.toDate().toLocaleDateString('es-AR');

const mapAttendances = (atts: Attendance[]): Notification[] =>
  atts.slice(0, 5).map((a) => ({
    id: `att-${a.id}`,
    type: 'asistencia' as const,
    title: `Asistencia cargada por ${a.cargadoPorNombre}`,
    subtitle: `${a.registros.length} registros · ${formatTime(a.fecha)}`,
    to: '/historial',
  }));

const mapNews = (items: News[]): Notification[] =>
  items.slice(0, 5).map((n) => ({
    id: `news-${n.id}`,
    type: 'novedad' as const,
    title: `Novedad cargada por ${n.cargadoPorNombre}`,
    subtitle: formatTime(n.fecha),
    to: '/historial',
  }));

const NotificationBell = () => {
  const { profile, hasRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    const unsubs: (() => void)[] = [];

    if (hasRole('supervisor')) {
      const unsub = subscribeRecentIncidents(10, (incidents) => {
        const pending = incidents.filter((i) => i.estado !== 'resuelto');
        const items: Notification[] = pending.map((inc) => ({
          id: inc.id,
          type: 'incidente',
          title: `Incidente: ${inc.descripcion.slice(0, 40)}${inc.descripcion.length > 40 ? '...' : ''}`,
          subtitle: `${inc.cargadoPorNombre} · ${formatDate(inc.fecha)}`,
          to: '/supervisor',
        }));
        setNotifications(items);
        setUnreadCount(pending.length);
      });
      unsubs.push(unsub);
    } else {
      const unsubAtt = subscribeTodayAttendances((atts) => {
        const attNotifs = mapAttendances(atts);
        setNotifications((prev) => {
          const others = prev.filter((n) => !n.id.startsWith('att-'));
          return [...attNotifs, ...others].slice(0, 15);
        });
      });
      unsubs.push(unsubAtt);

      const unsubNews = subscribeTodayNews((newsItems) => {
        const newsNotifs = mapNews(newsItems);
        setNotifications((prev) => {
          const others = prev.filter((n) => !n.id.startsWith('news-'));
          return [...newsNotifs, ...others].slice(0, 15);
        });
      });
      unsubs.push(unsubNews);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [profile, hasRole]);

  useEffect(() => {
    if (!hasInteracted && notifications.length > 0) {
      setUnreadCount(notifications.length);
    }
  }, [notifications, hasInteracted]);

  useEffect(() => {
    if (isOpen) {
      setHasInteracted(true);
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    navigate(notification.to, { viewTransition: true });
    setIsOpen(false);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    incidente: <AlertTriangle size={14} />,
    asistencia: <ClipboardCheck size={14} />,
    novedad: <Newspaper size={14} />,
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        className="notification-bell__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} nuevas)` : ''}`}
      >
        <Bell size={18} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__panel">
          <div className="notification-bell__panel-header">
            <span className="notification-bell__panel-title">Notificaciones</span>
          </div>
          <div className="notification-bell__panel-body">
            {notifications.length === 0 ? (
              <p className="notification-bell__empty">Sin notificaciones nuevas</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className="notification-bell__item"
                  onClick={() => handleNotificationClick(n)}
                >
                  <span
                    className={`notification-bell__item-icon notification-bell__item-icon--${n.type}`}
                  >
                    {typeIcons[n.type]}
                  </span>
                  <div className="notification-bell__item-text">
                    <span className="notification-bell__item-title">{n.title}</span>
                    <span className="notification-bell__item-subtitle">{n.subtitle}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
