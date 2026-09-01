import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useFormDraft } from '@/hooks/useFormDraft';
import SuccessAnimation from '@/components/common/SuccessAnimation/SuccessAnimation';
import { addNews } from '@/services/api/firestore';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import ContextHint from '@/components/common/ContextHint/ContextHint';
import { novedadSchema } from '@/utils/validation';
import { markOfflineWrite } from '@/utils/offlineQueue';
import { friendlyFirestoreError } from '@/utils/firestoreErrors';
import { NOVEDAD_TIPOS, FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import type { NovedadTipo } from '@/types';
import './Novedades.css';

type NewsFormData = z.infer<typeof novedadSchema>;

const Novedades = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const defaults = {
    fecha: new Date().toISOString().split('T')[0],
    tipo: '',
    hora: '',
    descripcion: '',
  };

  const draft = useFormDraft<NewsFormData>(defaults, { key: 'novedades' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(novedadSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(draft.values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = watch((data) => {
      draft.update(data as NewsFormData);
    });
    return () => sub.unsubscribe();
  }, [watch, draft.update]);

  const descripcion = useWatch({ control, name: 'descripcion' }) || '';

  const onSubmit = async (data: NewsFormData) => {
    if (!user || !profile || !profile.escuelaId) {
      setFeedback({
        type: 'error',
        message:
          !user || !profile
            ? 'Tu sesión no está completa. Volvé a iniciar sesión para continuar.'
            : 'Tu perfil no tiene una escuela asignada. Contactá al supervisor para configurarla.',
      });
      return;
    }

    const savedOffline = !navigator.onLine;

    try {
      await addNews({
        escuelaId: profile.escuelaId,
        fecha: new Date(data.fecha),
        tipo: data.tipo as NovedadTipo,
        hora: data.hora || undefined,
        descripcion: data.descripcion,
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
      });

      if (savedOffline) markOfflineWrite();

      haptic.success();
      setShowSuccess(true);
      setFeedback({
        type: 'success',
        message: savedOffline
          ? 'Sin conexión: novedad guardada en el dispositivo. Se sincronizará automáticamente al volver internet.'
          : 'Novedad registrada correctamente.',
      });
      reset();
      draft.clear();
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch (err) {
      console.error('Error al registrar la novedad:', err);
      setFeedback({ type: 'error', message: friendlyFirestoreError(err) });
    }
  };

  return (
    <section className="novedades">
      <SuccessAnimation show={showSuccess} />
      <button className="supervisor__back" onClick={() => navigate('/', { viewTransition: true })}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>
      <h2 className="novedades__title">Registrar Novedad</h2>
      <p className="novedades__subtitle">
        Completá los datos para registrar una novedad institucional.
      </p>
      <ContextHint id="novedades-form">
        Las novedades son informes del día a día (visitas, reuniones, actividades). Si es un
        problema urgente o edilicio, usá "Registrar Incidente".
      </ContextHint>

      <form className="novedades__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="novedades__row">
          <div className="novedades__field">
            <label className="novedades__label">Escuela</label>
            <span className="novedades__school-name">
              {profile?.escuelaId ? 'Tu escuela asignada' : 'Sin escuela asignada'}
            </span>
          </div>

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
            <span>{feedback.message}</span>
            <button className="novedades__feedback-close" onClick={() => setFeedback(null)}>
              ×
            </button>
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
