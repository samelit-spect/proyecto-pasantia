import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { addIncident } from '@/services/api/firestore';
import { fileToCompressedDataUrl } from '@/utils/image';
import { markOfflineWrite } from '@/utils/offlineQueue';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import ContextHint from '@/components/common/ContextHint/ContextHint';
import { incidenteSchema } from '@/utils/validation';
import { INCIDENT_CATEGORIAS, INCIDENT_URGENCIAS, FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import type { IncidentCategoria, IncidentUrgencia } from '@/types';
import './Incidentes.css';

type IncidentFormData = z.infer<typeof incidenteSchema>;

const Incidentes = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidenteSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      urgencia: '',
      ubicacion: '',
      descripcion: '',
    },
  });

  const descripcion = useWatch({ control, name: 'descripcion' }) || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (data: IncidentFormData) => {
    if (!user || !profile || !profile.escuelaId) return;

    const savedOffline = !navigator.onLine;

    try {
      let fotoDataUrl: string | undefined;
      if (foto) {
        fotoDataUrl = await fileToCompressedDataUrl(foto);
      }

      await addIncident({
        escuelaId: profile.escuelaId,
        fecha: new Date(data.fecha),
        categoria: data.categoria as IncidentCategoria,
        urgencia: data.urgencia as IncidentUrgencia,
        ubicacion: data.ubicacion || undefined,
        fotoDataUrl,
        descripcion: data.descripcion,
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
      });

      if (savedOffline) markOfflineWrite();

      setFeedback({
        type: 'success',
        message: savedOffline
          ? 'Sin conexión: incidente guardado en el dispositivo. Se sincronizará automáticamente al volver internet.'
          : 'Incidente registrado correctamente.',
      });
      reset();
      setFoto(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch {
      setFeedback({ type: 'error', message: 'Error al registrar el incidente. Intentá de nuevo.' });
    }
  };

  return (
    <section className="incidentes">
      <button className="supervisor__back" onClick={() => navigate('/', { viewTransition: true })}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>
      <h2 className="incidentes__title">Registrar Incidente</h2>
      <p className="incidentes__subtitle">
        Completá los datos para registrar un incidente institucional.
      </p>
      <ContextHint id="incidentes-form">
        El supervisor recibe el incidente al instante y podés seguir su avance en Historial. Si
        podés, adjuntá una foto: acelera la solución.
      </ContextHint>

      <form className="incidentes__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="incidentes__row">
          <div className="incidentes__field">
            <label className="incidentes__label">Escuela</label>
            <span className="incidentes__school-name">
              {profile?.escuelaId ? 'Tu escuela asignada' : 'Sin escuela asignada'}
            </span>
          </div>

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

        <div className="incidentes__row">
          <div className="incidentes__field">
            <label htmlFor="categoria" className="incidentes__label">
              Categoría del incidente
            </label>
            <select id="categoria" className="incidentes__select" {...register('categoria')}>
              <option value="">Seleccioná una categoría</option>
              {INCIDENT_CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <span className="incidentes__error">{errors.categoria.message}</span>
            )}
          </div>

          <div className="incidentes__field">
            <label htmlFor="urgencia" className="incidentes__label">
              Urgencia
            </label>
            <select id="urgencia" className="incidentes__select" {...register('urgencia')}>
              <option value="">Seleccioná la urgencia</option>
              {INCIDENT_URGENCIAS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.urgencia && (
              <span className="incidentes__error">{errors.urgencia.message}</span>
            )}
          </div>
        </div>

        <div className="incidentes__field">
          <label htmlFor="ubicacion" className="incidentes__label">
            Ubicación (opcional)
          </label>
          <input
            id="ubicacion"
            className="incidentes__input"
            type="text"
            placeholder="Ej: Aula 3, patio, baños, techos..."
            {...register('ubicacion')}
          />
          {errors.ubicacion && (
            <span className="incidentes__error">{errors.ubicacion.message}</span>
          )}
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

        <div className="incidentes__field">
          <label htmlFor="foto" className="incidentes__label">
            Foto del incidente (opcional)
          </label>
          <input
            id="foto"
            className="incidentes__file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <img className="incidentes__preview" src={preview} alt="Vista previa del incidente" />
          )}
        </div>

        {feedback && (
          <div
            className={`incidentes__feedback incidentes__feedback--${feedback.type}`}
            role="alert"
          >
            <span>{feedback.message}</span>
            <button className="incidentes__feedback-close" onClick={() => setFeedback(null)}>
              ×
            </button>
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
