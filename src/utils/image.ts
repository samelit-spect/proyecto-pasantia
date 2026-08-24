// Límite de entrada: los celulares actuales rara vez generan fotos de más de
// 15 MB; 20 MB cubre todo caso legítimo y evita que el usuario espere una
// compresión destinada a fallar.
export const MAX_IMAGE_INPUT_BYTES = 20 * 1024 * 1024;

// Firestore admite documentos de hasta 1 MB. Con margen para el resto de los
// campos, un data URL comprimido debe quedar por debajo de este umbral.
export const MAX_SAFE_DATA_URL_LENGTH = 900_000;

/**
 * Valida tipo y tamaño de un archivo de imagen seleccionado.
 * Devuelve el mensaje de error para mostrar al usuario, o null si es válido.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'El archivo debe ser una imagen.';
  }
  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    return 'La imagen supera los 20 MB. Seleccioná una más liviana o de menor resolución.';
  }
  return null;
}

/**
 * Verifica que un data URL comprimido entre seguro en un documento Firestore.
 */
export function isSafeDataUrl(dataUrl: string): boolean {
  return dataUrl.length <= MAX_SAFE_DATA_URL_LENGTH;
}

export function fileToCompressedDataUrl(
  file: File,
  maxSize = 1024,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
