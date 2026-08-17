const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-disabled': 'Esta cuenta fue desactivada.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
};

export function getAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
