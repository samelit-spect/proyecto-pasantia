import type { MessagePayload, Messaging } from 'firebase/messaging';
import { app } from '@/services/firebase';
import { deletePushToken, upsertPushToken } from '@/services/api/firestore';
import type { PushToken } from '@/types';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';

export interface PushSubscriptionHandle {
  token: string;
  unsubscribe: () => void;
}

let messagingPromise: Promise<Messaging> | null = null;

const getMessagingLazy = (): Promise<Messaging> => {
  if (!messagingPromise) {
    messagingPromise = import('firebase/messaging').then(({ getMessaging }) => getMessaging(app));
  }
  return messagingPromise;
};

export const pushSupported = (): boolean => {
  if (typeof window === 'undefined' || !VAPID_KEY) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

const detectPlatform = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Android')) return 'android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  return 'web';
};

export async function registerForPush(
  owner: { uid: string; nombre: string; rol: string },
  onForegroundMessage: (payload: MessagePayload) => void
): Promise<PushSubscriptionHandle | null> {
  if (!pushSupported()) return null;

  const { getToken, onMessage } = await import('firebase/messaging');

  try {
    const messaging = await getMessagingLazy();
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) {
      return null;
    }

    const now = new Date();
    const pushToken: PushToken = {
      userId: owner.uid,
      userNombre: owner.nombre,
      role: owner.rol,
      token,
      platform: detectPlatform(),
      activo: true,
      createdAt: now,
      updatedAt: now,
    };
    await upsertPushToken(pushToken);

    const unsubscribe = onMessage(messaging, (payload) => onForegroundMessage(payload));
    return { token, unsubscribe };
  } catch (error) {
    console.error('[push] Error en registerForPush:', error);
    return null;
  }
}

export async function removePushToken(token: string): Promise<void> {
  try {
    const { deleteToken } = await import('firebase/messaging');
    await deleteToken(await getMessagingLazy());
  } catch {
    // el token local puede no existir; continúamos con la limpieza en Firestore
  }

  try {
    await deletePushToken(token);
  } catch {
    // fuera de línea o ya borrado: se ignora silenciosamente
  }
}
