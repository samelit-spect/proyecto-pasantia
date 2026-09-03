import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.skipWaiting();

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Navegación con NetworkFirst: siempre se intenta el index.html actual del
// servidor para que los chunks dinámicos coincidan con el bundle recién
// desplegado. Si hubo un nuevo deploy, el HTML viejo (que referenciaba
// chunks que ya no existen) queda descartado y se evita el error
// "Failed to fetch dynamically imported module". El precache solo se usa
// como respaldo offline si no hay red.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return null;
            }
            return response;
          },
        },
      ],
    })
  )
);

// Cache de lectura de Firestore (SÓLO GET): las escrituras (POST/PATCH, los
// update de estado/verificación) salen directo por red para no interferir.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' && /^https:\/\/firestore\.googleapis\.com\/.*/i.test(url.href),
  new NetworkFirst({
    cacheName: 'firestore-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60,
      }),
      {
        cacheWillUpdate: async ({ response }) => {
          // Evita el "Cache.put() encountered a network error": no se guardan
          // en caché respuestas de error (5xx, CORS roto, opaque, sin cuerpo).
          // Se devuelve null para que Workbox simplemente no cachee y no falle.
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return null;
          }
          return response;
        },
      },
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