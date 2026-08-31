import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { registerForPush, removePushToken } from '@/services/push';
import type { PushSubscriptionHandle } from '@/services/push';

/**
 * Mantiene la suscripción a Web Push (FCM) del supervisor mientras la app
 * está abierta. Cuando la app está cerrada, el service worker (src/sw.js)
 * muestra la notificación; cuando está abierta en primer plano, onMessage
 * dispara un toast.
 */
export const usePushNotifications = (enabled: boolean): void => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const handleRef = useRef<PushSubscriptionHandle | null>(null);

  const uid = user?.uid ?? '';
  const profileId = profile?.uid ?? '';
  const nombre = profile?.nombre ?? '';
  const rol = profile?.rol ?? '';

  useEffect(() => {
    if (!enabled || !uid || !profileId || !nombre || !rol) {
      return;
    }

    let cancelled = false;
    const owner = { uid, nombre, rol };

    const setup = async () => {
      const handle = await registerForPush(owner, (payload) => {
        if (cancelled) return;
        const body = payload.notification?.body ?? payload.data?.text ?? 'Nuevo registro en SIPNAM';
        addToast('info', body);
      });

      if (cancelled || !handle) {
        if (handle) {
          handle.unsubscribe();
          removePushToken(handle.token);
        }
        return;
      }
      handleRef.current = handle;
    };

    setup();

    return () => {
      cancelled = true;
      const handle = handleRef.current;
      handleRef.current = null;
      if (handle) {
        handle.unsubscribe();
        removePushToken(handle.token);
      }
    };
  }, [enabled, uid, profileId, nombre, rol, addToast]);
};
