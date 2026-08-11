import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { addIncident } from '@/services/api/firestore';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { incidenteSchema } from '@/utils/validation';
import './Incidentes.css';

type IncidentFormData = z.infer<typeof incidenteSchema>;

const Incidentes = () => {
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
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidenteSchema),
    defaultValues: {
      escuelaId: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
    },
  });

  const descripcion = useWatch({ control, name: 'descripcion' }) || '';

  const onSubmit = async (data: IncidentFormData) => {
    if (!user || !profile) return;

    try {
      await addIncident({
        escuelaId: data.escuelaId,
        fecha: new Date(data.fecha),
        descripcion: data.descripcion,
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
      });

      setFeedback({ type: 'success', message: 'Incidente registrado correctamente.' });
      reset();
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', message: 'Error al registrar el incidente. Intentá de nuevo.' });
    }
  };

  return (
    <section className="incidentes">
      <h2 className="incidentes__title">Registrar Incidente</h2>
      <p className="incidentes__subtitle">
        Completá los datos para registrar un incidente institucional.
      </p>

      <form className="incidentes__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="incidentes__row">
          <Controller
            name="escuelaId"
            control={control}
            render={({ field }) => (
              <div>
                <SchoolSelect value={field.value} onChange={field.onChange} />
                {errors.escuelaId && (
                  <span className="incidentes__error">{errors.escuelaId.message}</span>
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
                {errors.fecha && <span className="incidentes__error">{errors.fecha.message}</span>}
              </div>
            )}
          />
        </div>

        <div className="incidentes__field">
          <label htmlFor="descripcion" className="incidentes__label">
            Descripción del incidente
          </label>
          <textarea
            id="descripcion"
            className="incidentes__textarea"
            placeholder="Describí el incidente (rotura, filtración, falla de servicio...)"
            rows={4}
            {...register('descripcion')}
          />
          <div className="incidentes__textarea-footer">
            {errors.descripcion && (
              <span className="incidentes__error">{errors.descripcion.message}</span>
            )}
            <span className="incidentes__charcount">{descripcion.length}/1000</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`incidentes__feedback incidentes__feedback--${feedback.type}`}
            role="alert"
          >
            {feedback.message}
          </div>
        )}

        <button type="submit" className="incidentes__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Incidente'}
        </button>
      </form>
    </section>
  );
};

export default Incidentes;
