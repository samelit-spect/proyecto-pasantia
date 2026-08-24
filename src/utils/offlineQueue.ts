const OFFLINE_WRITES_KEY = 'sipnam-offline-writes';

/**
 * Marca que hubo escrituras guardadas localmente mientras la app estaba
 * sin conexión. Firestore las sincroniza solo al volver la red; este
 * marcador permite a la UI mostrar "Sincronizado correctamente" después.
 */
export function markOfflineWrite(): void {
  try {
    localStorage.setItem(OFFLINE_WRITES_KEY, Date.now().toString());
  } catch {
    // localStorage no disponible (modo privado); el sync del SDK funciona igual.
  }
}

export function hasOfflineWrites(): boolean {
  try {
    return localStorage.getItem(OFFLINE_WRITES_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearOfflineWrites(): void {
  try {
    localStorage.removeItem(OFFLINE_WRITES_KEY);
  } catch {
    // noop
  }
}
