import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { School, Settings, Plus, X, ClipboardCheck, Newspaper, AlertTriangle } from 'lucide-react';
import {
  getSchools,
  addSchool,
  getAllAttendances,
  getAllNews,
  getAllIncidents,
} from '@/services/api/firestore';
import type { School as SchoolType, Attendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import './SupervisorSchools.css';

const TURNOS = ['mañana', 'tarde', 'vespertino', 'nocturno'];

const SupervisorSchools = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formTurno, setFormTurno] = useState(TURNOS[0]);
  const [formDireccion, setFormDireccion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const initialized = useRef(false);

  const loadSchools = async () => {
    try {
      const [schoolsData, attendancesData, newsData, incidentsData] = await Promise.all([
        getSchools(),
        getAllAttendances(),
        getAllNews(),
        getAllIncidents(),
      ]);
      setSchools(schoolsData);
      setRecentAttendances(attendancesData.slice(0, 5));
      setRecentNews(newsData.slice(0, 5));
      setRecentIncidents(incidentsData.slice(0, 5));
    } catch {
      setError('No se pudieron cargar los datos. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadSchools();
  }, []);

  const resetForm = () => {
    setFormNombre('');
    setFormTurno(TURNOS[0]);
    setFormDireccion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formNombre.trim()) {
      setFeedback({ type: 'error', message: 'El nombre es obligatorio.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addSchool({
        nombre: formNombre.trim(),
        turno: formTurno,
        direccion: formDireccion.trim() || undefined,
      });
      setFeedback({ type: 'success', message: 'Escuela creada correctamente.' });
      resetForm();
      setShowForm(false);
      await loadSchools();
    } catch {
      setFeedback({ type: 'error', message: 'Error al crear la escuela. Intentá de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="supervisor__header">
        <h2 className="supervisor__title">Panel de Supervisión</h2>
      </div>
      <p className="supervisor__subtitle">
        {schools.length} escuelas registradas · Seleccioná una para ver su información.
      </p>

      <div className="supervisor-schools__actions">
        <button
          className="supervisor-schools__add-btn"
          onClick={() => {
            resetForm();
            setFeedback(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? 'Cancelar' : 'Nueva escuela'}
        </button>

        <Link to="/supervisor/usuarios" className="supervisor-schools__users-link">
          <Settings size={16} strokeWidth={1.5} />
          Usuarios
        </Link>
      </div>

      {showForm && (
        <form className="supervisor-schools__form" onSubmit={handleSubmit}>
          <div className="supervisor-schools__form-row">
            <label className="supervisor-schools__label">
              Nombre *
              <input
                className="supervisor-schools__input"
                type="text"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Ej: Escuela N° 1"
              />
            </label>
            <label className="supervisor-schools__label">
              Turno
              <select
                className="supervisor-schools__select"
                value={formTurno}
                onChange={(e) => setFormTurno(e.target.value)}
              >
                {TURNOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="supervisor-schools__label">
            Dirección (opcional)
            <input
              className="supervisor-schools__input"
              type="text"
              value={formDireccion}
              onChange={(e) => setFormDireccion(e.target.value)}
              placeholder="Ej: Av. Principal 1234"
            />
          </label>

          {feedback && (
            <div
              className={`supervisor-schools__feedback supervisor-schools__feedback--${feedback.type}`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}

          <button type="submit" className="supervisor-schools__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Crear escuela'}
          </button>
        </form>
      )}

      {isLoading && <div className="supervisor__loading">Cargando escuelas...</div>}

      {error && <div className="supervisor__loading supervisor__loading--error">{error}</div>}

      {!isLoading && !error && schools.length === 0 && (
        <div className="supervisor__empty">No hay escuelas registradas.</div>
      )}

      {!isLoading && !error && schools.length > 0 && (
        <>
          <div className="supervisor-schools__summary">
            <div className="supervisor-schools__summary-card">
              <div className="supervisor-schools__summary-header">
                <div className="supervisor-schools__summary-icon supervisor-schools__summary-icon--asistencia">
                  <ClipboardCheck size={20} strokeWidth={1.5} />
                </div>
                <div className="supervisor-schools__summary-info">
                  <span className="supervisor-schools__summary-title">Asistencias</span>
                  <span className="supervisor-schools__summary-count">
                    {recentAttendances.length} recientes
                  </span>
                </div>
              </div>
              <div className="supervisor-schools__summary-list">
                {recentAttendances.length === 0 ? (
                  <span className="supervisor-schools__summary-empty">Sin registros</span>
                ) : (
                  recentAttendances.map((att) => (
                    <div key={att.id} className="supervisor-schools__summary-item">
                      <span className="supervisor-schools__summary-item-date">
                        {att.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-schools__summary-item-author">
                        {att.cargadoPorNombre}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="supervisor-schools__summary-card">
              <div className="supervisor-schools__summary-header">
                <div className="supervisor-schools__summary-icon supervisor-schools__summary-icon--novedades">
                  <Newspaper size={20} strokeWidth={1.5} />
                </div>
                <div className="supervisor-schools__summary-info">
                  <span className="supervisor-schools__summary-title">Novedades</span>
                  <span className="supervisor-schools__summary-count">
                    {recentNews.length} recientes
                  </span>
                </div>
              </div>
              <div className="supervisor-schools__summary-list">
                {recentNews.length === 0 ? (
                  <span className="supervisor-schools__summary-empty">Sin registros</span>
                ) : (
                  recentNews.map((n) => (
                    <div key={n.id} className="supervisor-schools__summary-item">
                      <span className="supervisor-schools__summary-item-date">
                        {n.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-schools__summary-item-desc">{n.descripcion}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="supervisor-schools__summary-card">
              <div className="supervisor-schools__summary-header">
                <div className="supervisor-schools__summary-icon supervisor-schools__summary-icon--incidentes">
                  <AlertTriangle size={20} strokeWidth={1.5} />
                </div>
                <div className="supervisor-schools__summary-info">
                  <span className="supervisor-schools__summary-title">Incidentes</span>
                  <span className="supervisor-schools__summary-count">
                    {recentIncidents.length} recientes
                  </span>
                </div>
              </div>
              <div className="supervisor-schools__summary-list">
                {recentIncidents.length === 0 ? (
                  <span className="supervisor-schools__summary-empty">Sin registros</span>
                ) : (
                  recentIncidents.map((inc) => (
                    <div key={inc.id} className="supervisor-schools__summary-item">
                      <span className="supervisor-schools__summary-item-date">
                        {inc.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <StatusBadge status={inc.estado} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <h3 className="supervisor-schools__section-title">Escuelas</h3>
          <div className="supervisor-schools__grid">
            {schools.map((school) => (
              <Link
                key={school.id}
                to={`/supervisor/escuela/${school.id}`}
                className="supervisor-schools__card"
              >
                <div className="supervisor-schools__card-icon">
                  <School size={24} strokeWidth={1.5} />
                </div>
                <div className="supervisor-schools__card-content">
                  <h4 className="supervisor-schools__card-name">{school.nombre}</h4>
                  <span className="supervisor-schools__card-turno">{school.turno}</span>
                </div>
                <span className="supervisor-schools__card-arrow">→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default SupervisorSchools;
