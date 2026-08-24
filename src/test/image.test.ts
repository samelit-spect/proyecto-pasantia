import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  isSafeDataUrl,
  MAX_IMAGE_INPUT_BYTES,
  MAX_SAFE_DATA_URL_LENGTH,
} from '@/utils/image';

const makeFile = (type: string, size: number): File => {
  const file = new File(['contenido'], 'archivo', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validateImageFile', () => {
  it('acepta una imagen dentro del límite', () => {
    const file = makeFile('image/jpeg', 3 * 1024 * 1024);
    expect(validateImageFile(file)).toBeNull();
  });

  it('rechaza archivos que no son imágenes', () => {
    const file = makeFile('application/pdf', 1024);
    expect(validateImageFile(file)).toBe('El archivo debe ser una imagen.');
  });

  it('rechaza imágenes que superan el máximo de entrada', () => {
    const file = makeFile('image/jpeg', MAX_IMAGE_INPUT_BYTES + 1);
    expect(validateImageFile(file)).toMatch(/supera los 20 MB/);
  });
});

describe('isSafeDataUrl', () => {
  it('acepta data URLs por debajo del límite de documento Firestore', () => {
    expect(isSafeDataUrl('data:image/jpeg;base64,' + 'a'.repeat(100_000))).toBe(true);
  });

  it('rechaza data URLs que exceden el límite seguro', () => {
    const huge = 'data:image/jpeg;base64,' + 'a'.repeat(MAX_SAFE_DATA_URL_LENGTH);
    expect(isSafeDataUrl(huge)).toBe(false);
  });
});
