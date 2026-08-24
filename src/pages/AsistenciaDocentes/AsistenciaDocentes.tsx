import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addDocenteAttendance, getDocenteAttendanceByUserAndDate } from '@/services/api/firestore';
import { fileToCompressedDataUrl } from '@/utils/image';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { todayISO } from '@/utils/validation';
import { markOfflineWrite } from '@/utils/offlineQueue';
import { FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import './AsistenciaDocentes.css';

const AsistenciaDocentes = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const escuelaId = profile?.escuelaId || '';

  const [fecha, setFecha] = useState(todayISO());
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
    setFeedback(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user || !profile) return;

    if (!escuelaId) {
      setFeedback({ type: 'error', message: 'No tenés una escuela asignada.' });
      return;
    }

    if (fecha > todayISO()) {
      setFeedback({ type: 'error', message: 'La fecha no puede ser en el futuro.' });
      return;
    }

    if (!foto) {
      setFeedback({ type: 'error', message: 'Seleccioná la foto de la planilla de asistencia.' });
      return;
    }

    if (!foto.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'El archivo debe ser una imagen.' });
      return;
    }

    setIsSubmitting(true);
    const savedOffline = !navigator.onLine;
    try {
      const existing = await getDocenteAttendanceByUserAndDate(
        escuelaId,
        new Date(fecha),
        user.uid
      );
      if (existing.length > 0) {
        setFeedback({
          type: 'error',
          message: 'Ya cargaste la asistencia de docentes para esta fecha.',
        });
        return;
      }

      const fotoDataUrl = await fileToCompressedDataUrl(foto);
      await addDocenteAttendance({
        escuelaId,
        fecha: new Date(fecha),
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
        fotoDataUrl,
      });

      if (savedOffline) markOfflineWrite();

      setFeedback({
        type: 'success',
        message: savedOffline
          ? 'Sin conexión: asistencia de docentes guardada en el dispositivo. Se sincronizará automáticamente al volver internet.'
          : 'Asistencia de docentes enviada correctamente.',
      });
      setFoto(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch {
      setFeedback({
        type: 'error',
        message: 'No se pudo enviar la asistencia. Revisá tu conexión e intentá de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="asist-docentes">
      <button className="supervisor__back" onClick={() => navigate('/', { viewTransition: true })}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>

      <h2 className="asist-docentes__title">Asistencia de Docentes</h2>
      <p className="asist-docentes__subtitle">
        Subí la foto de la planilla firmada de asistencia de docentes para el día seleccionado.
      </p>

      <form className="asist-docentes__form" onSubmit={handleSubmit}>
        <div className="asist-docentes__row">
          <div className="asist-docentes__school-info">
            <span className="asist-docentes__school-label">Escuela:</span>
            <span className="asist-docentes__school-name">
              {escuelaId ? 'Tu escuela asignada' : 'Sin escuela asignada'}
            </span>
          </div>
          <DatePicker value={fecha} onChange={setFecha} />
        </div>

        <div className="asist-docentes__field">
          <label htmlFor="foto-docentes" className="asist-docentes__file-label">
            {foto ? foto.name : 'Seleccionar foto de la planilla'}
          </label>
          <input
            id="foto-docentes"
            type="file"
            accept="image/*"
            className="asist-docentes__file-input"
            onChange={handleFileChange}
          />
        </div>

        {preview && (
          <img
            className="asist-docentes__preview"
            src={preview}
            alt="Vista previa de la planilla"
          />
        )}

        {feedback && (
          <div
            className={`asist-docentes__feedback asist-docentes__feedback--${feedback.type}`}
            role="alert"
          >
            <span>{feedback.message}</span>
            <button className="asist-docentes__feedback-close" onClick={() => setFeedback(null)}>
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          className="asist-docentes__submit"
          disabled={isSubmitting || !foto || !escuelaId}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Asistencia'}
        </button>
      </form>
    </section>
  );
};

export default AsistenciaDocentes;
