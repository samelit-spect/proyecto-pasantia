const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

const MESSAGES = {
  asistencias: {
    code: 'asistencia',
    template: (data) => `Nueva asistencia cargada por ${data.cargadoPorNombre || 'una escuela'}`,
  },
  asistencia_docentes: {
    code: 'asistencia-docentes',
    template: (data) =>
      `Asistencia del profesorado cargada por ${data.cargadoPorNombre || 'una escuela'}`,
  },
  novedades: {
    code: 'novedad',
    template: (data) => {
      const autor = data.cargadoPorNombre || 'una escuela';
      const desc = typeof data.descripcion === 'string' ? data.descripcion : '';
      return desc ? `Nueva novedad de ${autor}: ${truncate(desc)}` : `Nueva novedad de ${autor}`;
    },
  },
  incidentes: {
    code: 'incidente',
    template: (data) => {
      const autor = data.cargadoPorNombre || 'una escuela';
      const desc = typeof data.descripcion === 'string' ? data.descripcion : '';
      return desc ? `Nuevo incidente de ${autor}: ${truncate(desc)}` : `Nuevo incidente de ${autor}`;
    },
  },
  fotos: {
    code: 'foto',
    template: (data) =>
      `Nuevas fotos de planilla subidas por ${data.subidoPorNombre || 'una escuela'}`,
  },
};

function truncate(text, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

async function notifySupervisors(collectionKey, data) {
  const { code, template } = MESSAGES[collectionKey];
  const body = template(data);

  const snap = await db.collection('push_tokens').where('activo', '==', true).get();
  if (snap.empty) {
    console.log(`[push] sin suscriptores para ${collectionKey}`);
    return;
  }

  const tokens = snap.docs.map((d) => d.data().token);

  const result = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'SIPNAM · Nuevo registro',
      body,
    },
    data: {
      url: '/supervisor',
      type: code,
    },
  });

  console.log(`[push] ${collectionKey}: ${result.successCount}/${result.totalCount} entregados`);

  const invalidCodes = [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument',
  ];

  const stale = result.responses
    .map((response, i) => ({ response, doc: snap.docs[i] }))
    .filter(({ response }) => !response.success && response.error && invalidCodes.includes(response.error.code))
    .map(({ doc }) => doc.ref);

  await Promise.all(stale.map((ref) => ref.delete().catch(() => null)));
}

function createPushTrigger(documentPath, collectionKey) {
  return onDocumentCreated({ document: documentPath, timeoutSeconds: 60 }, async (event) => {
    try {
      await notifySupervisors(collectionKey, event.data.data());
    } catch (err) {
      console.error(`[push] fallo en ${collectionKey}:`, err);
    }
  });
}

exports.sendPushOnAsistencia = createPushTrigger('asistencias/{id}', 'asistencias');
exports.sendPushOnAsistenciaDocentes = createPushTrigger(
  'asistencia_docentes/{id}',
  'asistencia_docentes'
);
exports.sendPushOnNovedad = createPushTrigger('novedades/{id}', 'novedades');
exports.sendPushOnIncidente = createPushTrigger('incidentes/{id}', 'incidentes');
exports.sendPushOnFoto = createPushTrigger('fotos/{id}', 'fotos');