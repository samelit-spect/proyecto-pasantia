import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFotosBySchoolAndDate, addFoto, deleteFoto } from '@/services/api/firestore';
import { fileToCompressedDataUrl } from '@/utils/image';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import ContextHint from '@/components/common/ContextHint/ContextHint';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import { todayISO } from '@/utils/validation';
import { FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import type { Foto } from '@/types';
import './Fotos.css';

const Fotos = () => {
  const { user, profile } = useAuth();
  const escuelaId = profile?.escuelaId || '';
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [listError, setListError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!escuelaId || !fecha) return;

    let cancelled = false;
    getFotosBySchoolAndDate(escuelaId, fecha)
      .then((data) => {
        if (cancelled || !mounted.current) return;
        setFotos(data);
        setListError(null);
      })
      .catch(() => {
        if (cancelled || !mounted.current) return;
        setFotos([]);
        setListError('No se pudieron cargar las fotos. Revisá tu conexión e intentá de nuevo.');
      });

    return () => {
      cancelled = true;
    };
  }, [escuelaId, fecha, refreshKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setFeedback(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
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

    if (!file) {
      setFeedback({ type: 'error', message: 'Seleccioná una foto para subir.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'El archivo debe ser una imagen.' });
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await addFoto({
        escuelaId,
        fecha,
        dataUrl,
        nombreArchivo: file.name,
        subidoPor: user.uid,
        subidoPorNombre: profile.nombre,
      });
      setFile(null);
      setFeedback({ type: 'success', message: 'Foto subida correctamente.' });
      setRefreshKey((k) => k + 1);
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch {
      setFeedback({ type: 'error', message: 'Error al subir la foto. Intentá de nuevo.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (foto: Foto) => {
    if (!window.confirm('¿Seguro que querés eliminar esta foto?')) return;

    setFeedback(null);
    setDeletingId(foto.id);

    try {
      await deleteFoto(foto.id);
      setFotos((prev) => (prev ?? []).filter((f) => f.id !== foto.id));
      setFeedback({ type: 'success', message: 'Foto eliminada.' });
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo eliminar la foto.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="fotos">
      <h2 className="fotos__title">Foto Diaria de Asistencia</h2>
      <p className="fotos__subtitle">
        Subí la foto de la planilla firmada de asistencia para el día seleccionado.
      </p>
      <ContextHint id="fotos-diaria">
        La foto es el respaldo visual de la planilla firmada. Si te equivocás, podés borrarla y
        subir otra el mismo día.
      </ContextHint>

      <form className="fotos__form" onSubmit={handleUpload}>
        <div className="fotos__row">
          <div className="fotos__school-info">
            <span className="fotos__school-label">Escuela:</span>
            <span className="fotos__school-name">
              {profile?.escuelaId ? 'Tu escuela asignada' : 'Sin escuela asignada'}
            </span>
          </div>
          <DatePicker value={fecha} onChange={setFecha} />
        </div>

        <div className="fotos__file">
          <label htmlFor="foto-file" className="fotos__file-label">
            {file ? file.name : 'Seleccionar foto'}
          </label>
          <input
            id="foto-file"
            type="file"
            accept="image/*"
            className="fotos__file-input"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            className="fotos__submit"
            disabled={isUploading || !file || !escuelaId}
          >
            {isUploading ? 'Subiendo...' : 'Subir Foto'}
          </button>
        </div>
      </form>

      {feedback && (
        <div className={`fotos__feedback fotos__feedback--${feedback.type}`} role="alert">
          {feedback.message}
        </div>
      )}

      {listError && (
        <div className="fotos__feedback fotos__feedback--error" role="alert">
          {listError}
        </div>
      )}

      <div className="fotos__list">
        {!escuelaId || !fecha ? (
          <div className="fotos__empty">Seleccioná una escuela y una fecha.</div>
        ) : fotos === null ? (
          <div className="fotos__empty">Cargando fotos...</div>
        ) : fotos.length === 0 ? (
          <div className="fotos__empty">No hay fotos cargadas para esta escuela y fecha.</div>
        ) : (
          fotos.map((foto) => (
            <div key={foto.id} className="fotos__item">
              <FotoThumb dataUrl={foto.dataUrl} alt={foto.nombreArchivo} />
              <div className="fotos__item-meta">
                <span className="fotos__item-author">Subida por {foto.subidoPorNombre}</span>
                {foto.subidoPor === user?.uid && (
                  <button
                    className="fotos__item-delete"
                    disabled={deletingId === foto.id}
                    onClick={() => handleDelete(foto)}
                  >
                    {deletingId === foto.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Fotos;
