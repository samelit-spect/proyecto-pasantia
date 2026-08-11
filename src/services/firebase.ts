import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export { app };

enableIndexedDbPersistence(db).catch((err: { code?: string }) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistencia offline no disponible: múltiples pestañas abiertas');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistencia offline no disponible: el navegador no soporta IndexedDB');
  } else {
    console.warn('Error al habilitar la persistencia offline', err);
  }
});
