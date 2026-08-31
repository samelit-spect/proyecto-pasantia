import { auth } from '@/services/firebase';

export type PushCollection =
  'asistencias' | 'asistencia_docentes' | 'novedades' | 'incidentes' | 'fotos';

const PUSH_ENDPOINT = '/.netlify/functions/send-push';

/**
 * Avisa a la Netlify Function que se acaba de crear un registro para que
 * envíe el push al supervisor (PWA con la app cerrada). Fire-and-forget:
 * una falla aquí NUNCA debe interferir con el guardado en Firestore.
 */
export async function notifySupervisorPush(collection: PushCollection, id: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn('[push-send] Sin usuario autenticado, no se envía push');
    return;
  }

  try {
    const idToken = await currentUser.getIdToken();
    const res = await fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ collection, id }),
    });
    console.log('[push-send] respuesta send-push:', res.status, await res.text());
  } catch (error) {
    console.error('[push-send] Error al enviar push:', error);
  }
}
