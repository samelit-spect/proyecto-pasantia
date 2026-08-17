import { z } from 'zod';

export function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().split('T')[0];
}

const notFutureDate = (value: string): boolean => !value || value <= todayISO();

const fechaRule = z
  .string()
  .min(1, 'Seleccioná una fecha')
  .refine(notFutureDate, 'La fecha no puede ser en el futuro');

export const novedadSchema = z.object({
  fecha: fechaRule,
  tipo: z.string().min(1, 'Seleccioná un tipo de novedad'),
  hora: z.string().optional(),
  descripcion: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

export const incidenteSchema = z.object({
  fecha: fechaRule,
  categoria: z.string().min(1, 'Seleccioná una categoría'),
  urgencia: z.string().min(1, 'Seleccioná la urgencia'),
  ubicacion: z.string().max(100, 'Máximo 100 caracteres').optional(),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
});
