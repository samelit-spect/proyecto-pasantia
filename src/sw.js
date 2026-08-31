import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.skipWaiting();
self.clients.claim();

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

registerRoute(
  /^https:\/\/firestore\.googleapis\.com\/.*/i,
  new NetworkFirst({
    cacheName: 'firestore-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60,
      }),
    ],
  })
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const messaging = getMessaging(initializeApp(firebaseConfig));

onBackgroundMessage(messaging, (payload) => {
  const d = payload?.data ?? {};
  const title = d.title ?? 'SIPNAM · Nuevo registro';
  const options = {
    body: typeof d.body === 'string' && d.body ? d.body : 'Nuevo registro en SIPNAM',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: d.url ?? '/supervisor',
    },
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/supervisor';
  const absoluteUrl = new URL(url, self.location.href).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((client) => client.url === absoluteUrl);
      if (existing) {
        existing.navigate(absoluteUrl);
        existing.focus();
        return undefined;
      }
      return clients.openWindow(absoluteUrl);
    })
  );
});