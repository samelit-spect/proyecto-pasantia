import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { addNews } from '@/services/api/firestore';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { novedadSchema } from '@/utils/validation';
import { NOVEDAD_TIPOS, FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import type { NovedadTipo } from '@/types';
import './Novedades.css';

type NewsFormData = z.infer<typeof novedadSchema>;

const Novedades = () => {
  const { user, profile } = useAuth();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(novedadSchema),
    defaultValues: {
      escuelaId: '',
      fecha: new Date().toISOString().split('T')[0],
      tipo: '',
      hora: '',
      descripcion: '',
    },
  });

  const descripcion = useWatch({ control, name: 'descripcion' }) || '';

  const onSubmit = async (data: NewsFormData) => {
    if (!user || !profile) return;

    try {
      await addNews({
        escuelaId: data.escuelaId,
        fecha: new Date(data.fecha),
        tipo: data.tipo as NovedadTipo,
        hora: data.hora || undefined,
        descripcion: data.descripcion,
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
      });

      setFeedback({ type: 'success', message: 'Novedad registrada correctamente.' });
      reset();
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch {
      setFeedback({ type: 'error', message: 'Error al registrar la novedad. Intentá de nuevo.' });
    }
  };

  return (
    <section className="novedades">
      <h2 className="novedades__title">Registrar Novedad</h2>
      <p className="novedades__subtitle">
        Completá los datos para registrar una novedad institucional.
      </p>

      <form className="novedades__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="novedades__row">
          <Controller
            name="escuelaId"
            control={control}
            render={({ field }) => (
              <div>
                <SchoolSelect value={field.value} onChange={field.onChange} />
                {errors.escuelaId && (
                  <span className="novedades__error">{errors.escuelaId.message}</span>
                )}
              </div>
            )}
          />

          <Controller
            name="fecha"
            control={control}
            render={({ field }) => (
              <div>
                <DatePicker value={field.value} onChange={field.onChange} />
                {errors.fecha && <span className="novedades__error">{errors.fecha.message}</span>}
              </div>
            )}
          />
        </div>

        <div className="novedades__row">
          <div className="novedades__field">
            <label htmlFor="tipo" className="novedades__label">
              Tipo de novedad
            </label>
            <select id="tipo" className="novedades__select" {...register('tipo')}>
              <option value="">Seleccioná un tipo</option>
              {NOVEDAD_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.tipo && <span className="novedades__error">{errors.tipo.message}</span>}
          </div>

          <div className="novedades__field">
            <label htmlFor="hora" className="novedades__label">
              Hora (opcional)
            </label>
            <input id="hora" type="time" className="novedades__input" {...register('hora')} />
            {errors.hora && <span className="novedades__error">{errors.hora.message}</span>}
          </div>
        </div>

        <div className="novedades__field">
          <label htmlFor="descripcion" className="novedades__label">
            Descripción de la novedad
          </label>
          <textarea
            id="descripcion"
            className="novedades__textarea"
            placeholder="Describí la novedad institucional..."
            rows={4}
            {...register('descripcion')}
          />
          <div className="novedades__textarea-footer">
            {errors.descripcion && (
              <span className="novedades__error">{errors.descripcion.message}</span>
            )}
            <span className="novedades__charcount">{descripcion.length}/500</span>
          </div>
        </div>

        {feedback && (
          <div className={`novedades__feedback novedades__feedback--${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        <button type="submit" className="novedades__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Novedad'}
        </button>
      </form>
    </section>
  );
};

export default Novedades;
