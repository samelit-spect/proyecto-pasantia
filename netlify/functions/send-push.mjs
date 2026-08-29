import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountEnv) {
  console.error('[send-push] Falta la variable FIREBASE_SERVICE_ACCOUNT en Netlify');
}

const serviceAccount = serviceAccountEnv ? JSON.parse(serviceAccountEnv) : null;

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : {});

const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

const COLLECTIONS = {
  asistencias: { roles: ['director', 'vice', 'preceptor'], code: 'asistencia' },
  asistencia_docentes: { roles: ['director', 'vice', 'preceptor'], code: 'asistencia-docentes' },
  novedades: { roles: ['director', 'vice'], code: 'novedad' },
  incidentes: { roles: ['director', 'vice'], code: 'incidente' },
  fotos: { roles: ['preceptor'], code: 'foto' },
};

function truncate(text, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function buildBody(collection, data) {
  const author = collection === 'fotos' ? data.subidoPorNombre || 'una escuela' : data.cargadoPorNombre || 'una escuela';
  const desc = typeof data.descripcion === 'string' ? data.descripcion : '';
  switch (collection) {
    case 'asistencias':
      return `Nueva asistencia cargada por ${author}`;
    case 'asistencia_docentes':
      return `Asistencia del profesorado cargada por ${author}`;
    case 'novedades':
      return desc ? `Nueva novedad de ${author}: ${truncate(desc)}` : `Nueva novedad de ${author}`;
    case 'incidentes':
      return desc ? `Nuevo incidente de ${author}: ${truncate(desc)}` : `Nuevo incidente de ${author}`;
    case 'fotos':
      return `Nuevas fotos de planilla subidas por ${author}`;
    default:
      return 'Nuevo registro en SIPNAM';
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method-not-allowed' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'body-invalid' });
  }

  const { collection, id } = payload;
  if (typeof collection !== 'string' || typeof id !== 'string' || !id) {
    return json(400, { error: 'parametros-invalidos' });
  }
  const config = COLLECTIONS[collection];
  if (!config) return json(400, { error: 'coleccion-no-soportada' });

  const authorization = event.headers?.authorization || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!idToken) return json(401, { error: 'no-autorizado' });

  let identity;
  try {
    identity = await auth.verifyIdToken(idToken);
  } catch {
    return json(401, { error: 'token-invalido' });
  }

  try {
    const profileSnap = await db.collection('usuarios').doc(identity.uid).get();
    if (!profileSnap.exists) return json(403, { error: 'perfil-no-existe' });
    const profile = profileSnap.data();
    if (!config.roles.includes(profile.rol)) return json(403, { error: 'rol-no-permitido' });

    const docSnap = await db.collection(collection).doc(id).get();
    if (!docSnap.exists) return json(404, { error: 'documento-no-existe' });
    const data = docSnap.data();

    const authorField = collection === 'fotos' ? 'subidoPor' : 'cargadoPor';
    if (data[authorField] !== identity.uid) return json(403, { error: 'autor-no-coincide' });
    if (data.escuelaId !== profile.escuelaId) return json(403, { error: 'escuela-no-coincide' });

    const tokenSnap = await db.collection('push_tokens').where('activo', '==', true).get();
    if (tokenSnap.empty) return json(200, { sent: 0 });

    const tokens = tokenSnap.docs.map((doc) => doc.data().token);
    const message = {
      tokens,
      notification: {
        title: 'SIPNAM · Nuevo registro',
        body: buildBody(collection, data),
      },
      data: {
        url: '/supervisor',
        type: config.code,
      },
    };

    const result = await messaging.sendEachForMulticast(message);

    const invalidCodes = [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
      'messaging/invalid-argument',
    ];
    const stale = result.responses
      .map((response, i) => ({ response, doc: tokenSnap.docs[i] }))
      .filter(
        ({ response }) =>
          !response.success &&
          response.error &&
          invalidCodes.includes(response.error.code)
      )
      .map(({ doc }) => doc.ref);

    await Promise.all(stale.map((ref) => ref.delete().catch(() => null)));

    return json(200, { sent: result.successCount, total: result.totalCount });
  } catch (error) {
    console.error('[send-push] error:', error);
    return json(500, { error: 'error-interno' });
  }
};