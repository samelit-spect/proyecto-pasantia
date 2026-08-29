import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, ClipboardCheck, Newspaper, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeTodayAttendances,
  subscribeTodayNews,
  subscribeTodayIncidents,
} from '@/services/api/firestore';
import type { Attendance, News, Incident } from '@/types';
import { FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import './SupervisorLiveAlerts.css';

interface LiveAlert {
  id: string;
  kind: 'asistencia' | 'novedad' | 'incidente';
  text: string;
}

const KIND_ICONS = {
  asistencia: <ClipboardCheck size={16} strokeWidth={1.5} />,
  novedad: <Newspaper size={16} strokeWidth={1.5} />,
  incidente: <AlertTriangle size={16} strokeWidth={1.5} />,
};

const PERM_DISMISS_KEY = 'sipnam-notif-perm-dismissed';

const notificationsSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

const showNativeNotification = (body: string) => {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;

  const title = 'SIPNAM · Nuevo registro';
  try {
    navigator.serviceWorker?.ready
      .then((reg) =>
        reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag: `sipnam-${Date.now()}`,
        })
      )
      .catch(() => new Notification(title, { body, icon: '/pwa-192x192.png' }));
  } catch {
    // algunos navegadores sin SW listo: ignoramos silenciosamente
  }
};

const SupervisorLiveAlerts = () => {
  const { profile, hasRole } = useAuth();
  const isActive = Boolean(profile && hasRole('supervisor'));

  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const seenRef = useRef<Record<string, Set<string>>>({
    asistencia: new Set(),
    novedad: new Set(),
    incidente: new Set(),
  });
  const initializedRef = useRef<Record<string, boolean>>({
    asistencia: false,
    novedad: false,
    incidente: false,
  });

  const [permission, setPermission] = useState<NotificationPermission | null>(
    notificationsSupported() ? Notification.permission : null
  );
  const pushEnabled = isActive && notificationsSupported() && permission === 'granted';
  usePushNotifications(pushEnabled);
  const [permDismissed, setPermDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PERM_DISMISS_KEY) === '1';
    } catch {
      return true;
    }
  });
  const permBannerOpen =
    isActive && notificationsSupported() && permission === 'default' && !permDismissed;

  useEffect(() => {
    if (!isActive) return;

    let unmounted = false;

    const pushAlert = (kind: LiveAlert['kind'], text: string) => {
      if (unmounted) return;
      const alert: LiveAlert = { id: `${Date.now()}-${Math.random()}`, kind, text };
      setAlerts((prev) => [...prev.slice(-2), alert]);
      setTimeout(() => {
        if (!unmounted) setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      }, FEEDBACK_AUTO_CLEAR_MS * 2);
      showNativeNotification(text);
    };

    const handleSnapshot = (
      kind: LiveAlert['kind'],
      data: { id: string; cargadoPorNombre?: string }[],
      buildText: (item: { id: string; cargadoPorNombre?: string }) => string
    ) => {
      const seen = seenRef.current[kind];
      if (!initializedRef.current[kind]) {
        data.forEach((d) => seen.add(d.id));
        initializedRef.current[kind] = true;
        return;
      }

      const fresh = data.filter((d) => !seen.has(d.id));
      fresh.forEach((d) => seen.add(d.id));
      if (fresh.length === 0) return;

      if (fresh.length > 1) {
        pushAlert(kind, `${fresh.length} registros nuevos de ${kind}`);
      } else {
        pushAlert(kind, buildText(fresh[0]));
      }
    };

    const unsubs = [
      subscribeTodayAttendances((data: Attendance[]) =>
        handleSnapshot('asistencia', data, (a) => `Nueva asistencia de ${a.cargadoPorNombre}`)
      ),
      subscribeTodayNews((data: News[]) =>
        handleSnapshot('novedad', data, (n) => `Nueva novedad de ${n.cargadoPorNombre}`)
      ),
      subscribeTodayIncidents((data: Incident[]) =>
        handleSnapshot('incidente', data, (i) => `Nuevo incidente de ${i.cargadoPorNombre}`)
      ),
    ];

    return () => {
      unmounted = true;
      unsubs.forEach((unsub) => unsub());
      seenRef.current = {
        asistencia: new Set(),
        novedad: new Set(),
        incidente: new Set(),
      };
      initializedRef.current = {
        asistencia: false,
        novedad: false,
        incidente: false,
      };
    };
  }, [isActive]);

  const requestPermission = async () => {
    if (!notificationsSupported()) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {
      // noop
    } finally {
      setPermDismissed(true);
      try {
        localStorage.setItem(PERM_DISMISS_KEY, '1');
      } catch {
        // noop
      }
    }
  };

  const dismissPermBanner = () => {
    setPermDismissed(true);
    try {
      localStorage.setItem(PERM_DISMISS_KEY, '1');
    } catch {
      // noop
    }
  };

  if (!isActive) return null;

  return (
    <>
      {permBannerOpen && (
        <div className="supervisor-alerts__perm animate-fade-in" role="note">
          <Bell size={16} strokeWidth={1.5} className="supervisor-alerts__perm-icon" />
          <p className="supervisor-alerts__perm-text">
            ¿Querés enterarte al instante cuando una escuela cargue algo?
          </p>
          <button className="supervisor-alerts__perm-action" onClick={requestPermission}>
            Activar avisos
          </button>
          <button
            className="supervisor-alerts__perm-close"
            onClick={dismissPermBanner}
            aria-label="No mostrar más"
          >
            <BellOff size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div className="supervisor-alerts" aria-live="polite">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`supervisor-alerts__toast supervisor-alerts__toast--${alert.kind}`}
          >
            <span className="supervisor-alerts__toast-icon">{KIND_ICONS[alert.kind]}</span>
            <span className="supervisor-alerts__toast-text">{alert.text}</span>
            <button
              className="supervisor-alerts__toast-close"
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              aria-label="Cerrar"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default SupervisorLiveAlerts;
