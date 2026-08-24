export interface Holiday {
  date: string;
  name: string;
}

interface FixedHoliday {
  month: number;
  day: number;
  name: string;
  adjustable?: boolean;
}

const FIXED_HOLIDAYS: FixedHoliday[] = [
  { month: 1, day: 1, name: 'Año Nuevo' },
  { month: 3, day: 24, name: 'Día Nacional de la Memoria por la Verdad y la Justicia' },
  { month: 4, day: 2, name: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
  { month: 5, day: 1, name: 'Día del Trabajador' },
  { month: 5, day: 25, name: 'Día de la Revolución de Mayo' },
  {
    month: 6,
    day: 17,
    name: 'Paso a la Inmortalidad del General Martín Miguel de Güemes',
    adjustable: true,
  },
  { month: 6, day: 20, name: 'Paso a la Inmortalidad del General Manuel Belgrano' },
  { month: 7, day: 9, name: 'Día de la Independencia' },
  {
    month: 8,
    day: 17,
    name: 'Paso a la Inmortalidad del General José de San Martín',
    adjustable: true,
  },
  { month: 10, day: 12, name: 'Día del Respeto a la Diversidad Cultural', adjustable: true },
  { month: 11, day: 20, name: 'Día de la Soberanía Nacional', adjustable: true },
  { month: 12, day: 8, name: 'Inmaculada Concepción de María' },
  { month: 12, day: 25, name: 'Navidad' },
];

const pad = (n: number): string => String(n).padStart(2, '0');

const toISO = (y: number, m: number, d: number): string => `${y}-${pad(m)}-${pad(d)}`;

/**
 * Domingo de Pascua (algoritmo Gregoriano anónimo / Meeus).
 */
export const easterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};

const addDaysUTC = (date: Date, days: number): Date => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

/**
 * Ley 27.399: si el aniversario cae martes o miércoles se pasa al lunes
 * anterior; si cae jueves o viernes, al lunes siguiente.
 */
const adjustToMonday = (date: Date): Date => {
  const dow = date.getUTCDay();
  if (dow === 2) return addDaysUTC(date, -1);
  if (dow === 3) return addDaysUTC(date, -2);
  if (dow === 4) return addDaysUTC(date, 4);
  if (dow === 5) return addDaysUTC(date, 3);
  return date;
};

const holidaysForYear = (year: number): Holiday[] => {
  const list: Holiday[] = [];

  for (const h of FIXED_HOLIDAYS) {
    const base = new Date(Date.UTC(year, h.month - 1, h.day));
    const observed = h.adjustable ? adjustToMonday(base) : base;
    list.push({
      date: toISO(observed.getUTCFullYear(), observed.getUTCMonth() + 1, observed.getUTCDate()),
      name: h.name,
    });
  }

  const easter = easterSunday(year);
  const carnivalMonday = addDaysUTC(easter, -48);
  const carnivalTuesday = addDaysUTC(easter, -47);
  const goodFriday = addDaysUTC(easter, -2);
  const y = carnivalTuesday.getUTCFullYear();

  list.push(
    {
      date: toISO(y, carnivalMonday.getUTCMonth() + 1, carnivalMonday.getUTCDate()),
      name: 'Carnaval',
    },
    {
      date: toISO(y, carnivalTuesday.getUTCMonth() + 1, carnivalTuesday.getUTCDate()),
      name: 'Carnaval',
    },
    { date: toISO(y, goodFriday.getUTCMonth() + 1, goodFriday.getUTCDate()), name: 'Viernes Santo' }
  );

  return list.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Devuelve el feriado nacional argentino observado en esa fecha,
 * o null si no es feriado. Formato esperado: 'YYYY-MM-DD'.
 *
 * Nota: no incluye los "días no laborables con fines turísticos"
 * ni feriados provinciales (se decretan año a año).
 */
export const getHoliday = (isoDate: string): Holiday | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const year = Number(match[1]);
  if (year < 1990 || year > 2100) return null;

  return holidaysForYear(year).find((h) => h.date === isoDate) ?? null;
};

export const isHoliday = (isoDate: string): boolean => getHoliday(isoDate) !== null;
