import { describe, it, expect } from 'vitest';
import { novedadSchema, incidenteSchema, todayISO } from '@/utils/validation';

describe('todayISO', () => {
  it('retorna la fecha de hoy en formato YYYY-MM-DD', () => {
    const iso = todayISO();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('novedadSchema', () => {
  it('acepta un registro válido', () => {
    const result = novedadSchema.safeParse({
      fecha: todayISO(),
      tipo: 'acto',
      descripcion: 'Acto de fin de año del establecimiento.',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una fecha futura', () => {
    const future = '2999-01-01';
    const result = novedadSchema.safeParse({
      fecha: future,
      tipo: 'acto',
      descripcion: 'Novedad con fecha futura.',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza tipo de novedad vacío', () => {
    const result = novedadSchema.safeParse({
      fecha: todayISO(),
      tipo: '',
      descripcion: 'Novedad sin tipo.',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza descripción muy corta', () => {
    const result = novedadSchema.safeParse({
      fecha: todayISO(),
      tipo: 'acto',
      descripcion: 'Cort',
    });
    expect(result.success).toBe(false);
  });
});

describe('incidenteSchema', () => {
  it('acepta un registro válido', () => {
    const result = incidenteSchema.safeParse({
      fecha: todayISO(),
      categoria: 'rotura',
      urgencia: 'media',
      descripcion: 'Filtración de agua en el techo del aula 3.',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una fecha futura', () => {
    const result = incidenteSchema.safeParse({
      fecha: '2999-01-01',
      categoria: 'rotura',
      urgencia: 'media',
      descripcion: 'Incidente con fecha futura.',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza categoría vacía', () => {
    const result = incidenteSchema.safeParse({
      fecha: todayISO(),
      categoria: '',
      urgencia: 'media',
      descripcion: 'Incidente sin categoría.',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza urgencia vacía', () => {
    const result = incidenteSchema.safeParse({
      fecha: todayISO(),
      categoria: 'rotura',
      urgencia: '',
      descripcion: 'Incidente sin urgencia.',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza descripción de menos de 10 caracteres', () => {
    const result = incidenteSchema.safeParse({
      fecha: todayISO(),
      categoria: 'rotura',
      urgencia: 'media',
      descripcion: 'Muy corta',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza descripción que supera 1000 caracteres', () => {
    const result = incidenteSchema.safeParse({
      fecha: todayISO(),
      categoria: 'rotura',
      urgencia: 'media',
      descripcion: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
