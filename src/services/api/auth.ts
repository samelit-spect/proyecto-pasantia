import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { firebaseConfig } from '@/services/firebase';

/**
 * Crea una cuenta de usuario en Firebase Auth sin modificar la sesión actual.
 *
 * Se usa una segunda app + Auth con persistencia en memoria: al crear el usuario,
 * Firebase Auth inicia sesión con la cuenta nueva en esa instancia aislada, se
 * captura su UID y se cierra la sesión temporal. La sesión del Supervisor en el
 * Auth principal queda intacta.
 */
const adminApp = initializeApp(firebaseConfig, 'admin-user-creation');
const adminAuth = initializeAuth(adminApp, { persistence: inMemoryPersistence });

export async function createUserAccount(email: string, password: string): Promise<string> {
  try {
    const credential = await createUserWithEmailAndPassword(adminAuth, email, password);
    return credential.user.uid;
  } finally {
    await signOut(adminAuth);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(adminAuth, email);
}
