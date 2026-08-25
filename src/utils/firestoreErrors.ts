interface FirestoreErrorLike {
  code?: string;
}

// Mapeo de códigos de error de Firebase a mensajes accionables para el
// personal escolar. Cualquier código no listado cae en el mensaje genérico.
const FRIENDLY_MESSAGES: Record<string, string> = {
  // Cuota diaria/gratuita agotada: el servidor rechaza la operación de forma
  // definitiva (NO queda en cola offline como cuando no hay conexión).
  'resource-exhausted':
    'El servicio alcanzó su límite por hoy. Reintentá más tarde o avisá al supervisor.',

  'unavailable':
    'El servicio no responde en este momento. Reintentá en unos minutos.',

  'network-request-failed':
    'Problema de conexión. Verificá tu internet e intentá de nuevo.',

  'permission-denied':
    'No tenés permiso para realizar esta acción. Avísale al supervisor.',

  'failed-precondition':
    'La operación necesita una configuración pendiente del sistema. Avísale al supervisor.',

  'cancelled':
    'La operación fue cancelada. Intentá de nuevo.',
};

/**
 * Convierte un error (de Firebase u otro) en un mensaje claro para mostrar
 * al usuario, distinguiendo cuota agotada, red y permisos de errores genéricos.
 */
export function friendlyFirestoreError(error: unknown): string {
  const code = (error as FirestoreErrorLike)?.code;
  if (code && FRIENDLY_MESSAGES[code]) {
    return FRIENDLY_MESSAGES[code];
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
