import { describe, expect, it } from 'vitest';
import { easterSunday, getHoliday, isHoliday } from './holidays';

describe('easterSunday', () => {
  it('calcula Pascua 2026 (5 de abril)', () => {
    expect(easterSunday(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
  });

  it('calcula Pascua 2027 (28 de marzo)', () => {
    expect(easterSunday(2027).toISOString().slice(0, 10)).toBe('2027-03-28');
  });
});

describe('getHoliday - feriados inamovibles 2026', () => {
  it('Año Nuevo', () => {
    expect(getHoliday('2026-01-01')?.name).toBe('Año Nuevo');
  });

  it('Día de la Memoria', () => {
    expect(getHoliday('2026-03-24')?.name).toContain('Memoria');
  });

  it('Malvinas', () => {
    expect(getHoliday('2026-04-02')?.name).toContain('Malvinas');
  });

  it('Revolución de Mayo', () => {
    expect(getHoliday('2026-05-25')?.name).toBe('Día de la Revolución de Mayo');
  });

  it('Independencia', () => {
    expect(getHoliday('2026-07-09')?.name).toBe('Día de la Independencia');
  });

  it('Navidad', () => {
    expect(getHoliday('2026-12-25')?.name).toBe('Navidad');
  });
});

describe('getHoliday - feriados con fecha variable', () => {
  it('Carnaval 2026: lunes 16 y martes 17 de febrero', () => {
    expect(getHoliday('2026-02-16')?.name).toBe('Carnaval');
    expect(getHoliday('2026-02-17')?.name).toBe('Carnaval');
  });

  it('Viernes Santo 2026: 3 de abril', () => {
    expect(getHoliday('2026-04-03')?.name).toBe('Viernes Santo');
  });

  it('Carnaval 2027: 8 y 9 de febrero (Pascua 28/3)', () => {
    expect(getHoliday('2027-02-08')?.name).toBe('Carnaval');
    expect(getHoliday('2027-02-09')?.name).toBe('Carnaval');
  });
});

describe('getHoliday - traslado al lunes (Ley 27.399)', () => {
  it('Güemes 2026: cae miércoles 17 → se observa lunes 15', () => {
    expect(getHoliday('2026-06-15')?.name).toContain('Güemes');
    expect(getHoliday('2026-06-16')).toBeNull();
    expect(getHoliday('2026-06-17')).toBeNull();
  });

  it('Soberanía 2026: cae viernes 20 → se observa lunes 23', () => {
    expect(getHoliday('2026-11-23')?.name).toBe('Día de la Soberanía Nacional');
    expect(getHoliday('2026-11-20')).toBeNull();
  });

  it('San Martín 2027: cae martes 17 → se observa lunes 16', () => {
    expect(getHoliday('2027-08-16')?.name).toContain('San Martín');
    expect(getHoliday('2027-08-17')).toBeNull();
  });

  it('Güemes 2027: cae jueves 17 → se observa lunes 21', () => {
    expect(getHoliday('2027-06-21')?.name).toContain('Güemes');
  });

  it('Belgrano es inamovible: 20/6/2026 cae sábado y no se mueve', () => {
    expect(getHoliday('2026-06-20')?.name).toContain('Belgrano');
  });
});

describe('getHoliday - casos borde', () => {
  it('día común devuelve null', () => {
    expect(getHoliday('2026-09-15')).toBeNull();
    expect(isHoliday('2026-09-15')).toBe(false);
  });

  it('formato inválido devuelve null', () => {
    expect(getHoliday('25/12/2026')).toBeNull();
    expect(getHoliday('')).toBeNull();
  });

  it('isHoliday funciona como atajo', () => {
    expect(isHoliday('2026-05-01')).toBe(true);
    expect(isHoliday('2026-05-02')).toBe(false);
  });
});
