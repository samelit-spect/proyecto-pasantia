import { useState, useEffect, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  School,
  Settings,
  Plus,
  X,
  Pencil,
  Trash2,
  ClipboardCheck,
  Newspaper,
  AlertTriangle,
  ArrowLeft,
  Download,
} from 'lucide-react';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/context/ToastContext';
import { useHaptic } from '@/hooks/useHaptic';
import { useAmbientMotion } from '@/hooks/useAmbientMotion';
import {
  getSchools,
  addSchool,
  updateSchool,
  deleteSchool,
  subscribeTodayAttendances,
  subscribeTodayNews,
  subscribeTodayIncidents,
} from '@/services/api/firestore';
import type { School as SchoolType, Attendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import { SupervisorSchoolsSkeleton } from './SupervisorSkeleton';
import './SupervisorSchools.css';

const TURNOS = ['mañana', 'tarde', 'vespertino', 'nocturno'] as const;

const schoolSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  turno: z.enum(TURNOS),
  direccion: z.string().optional(),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

/** Paleta de acentos por escuela (id -> color estable entre renders). */
const SCHOOL_ACCENTS = ['blue', 'green', 'purple', 'teal', 'yellow', 'red'] as const;

const schoolAccent = (id: string): (typeof SCHOOL_ACCENTS)[number] => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SCHOOL_ACCENTS[hash % SCHOOL_ACCENTS.length];
};

interface SchoolCardProps {
  school: SchoolType;
  att: number;
  nov: number;
  inc: number;
  confirming: boolean;
  editing: boolean;
  saving: boolean;
  onEdit: (school: SchoolType) => void;
  onCancelEdit: () => void;
  onSaveEdit: (school: SchoolType, data: SchoolFormData) => void;
  onRequestDelete: (school: SchoolType) => void;
  onConfirmDelete: (school: SchoolType) => void;
}

/**
 * Contador del resumen del día: hace un pequeño "pop" cada vez que el valor
 * sube en vivo (evento del snapshot). Gateado por useAmbientMotion para no
 * animar en conexiones débiles u offline.
 */
const LiveCount = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const ambient = useAmbientMotion();
  return (
    <span
      key={ambient ? value : 'static'}
      className={`supervisor-schools__summary-count ${ambient ? 'supervisor-schools__bump' : ''}`}
    >
      {value} {suffix}
    </span>
  );
};

interface SchoolEditFormProps {
  school: SchoolType;
  saving: boolean;
  onCancel: () => void;
  onSave: (data: SchoolFormData) => void;
}

const SchoolEditForm = ({ school, saving, onCancel, onSave }: SchoolEditFormProps) => {
  const [nombre, setNombre] = useState(school.nombre);
  const [turno, setTurno] = useState<SchoolFormData['turno']>(school.turno as SchoolFormData['turno']);
  const [direccion, setDireccion] = useState(school.direccion || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length === 0) return;
    onSave({ nombre: nombre.trim(), turno, direccion: direccion.trim() || undefined });
  };

  return (
    <form className="supervisor-schools__edit" onSubmit={submit}>
      <h4 className="supervisor-schools__edit-title">Editar escuela</h4>
      <label className="supervisor-schools__edit-label">
        Nombre *
        <input
          className="supervisor-schools__input"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Escuela N° 1"
        />
      </label>
      <label className="supervisor-schools__edit-label">
        Turno
        <select
          className="supervisor-schools__select"
          value={turno}
          onChange={(e) => setTurno(e.target.value as SchoolFormData['turno'])}
        >
          {TURNOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="supervisor-schools__edit-label">
        Dirección (opcional)
        <input
          className="supervisor-schools__input"
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Av. Principal 1234"
        />
      </label>
      <div className="supervisor-schools__edit-actions">
        <button
          type="button"
          className="supervisor-schools__edit-btn supervisor-schools__edit-btn--cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="supervisor-schools__edit-btn supervisor-schools__edit-btn--save"
          disabled={saving || nombre.trim().length === 0}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

const SchoolCard = ({
  school,
  att,
  nov,
  inc,
  confirming,
  editing,
  saving,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestDelete,
  onConfirmDelete,
}: SchoolCardProps) => {
  const to = `/supervisor/escuela/${school.id}`;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const accent = schoolAccent(school.id);

  useEffect(() => {
    if (!isTransitioning) return;
    const t = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(t);
  }, [isTransitioning]);

  if (editing) {
    return (
      <div
        className={`supervisor-schools__card supervisor-schools__card--${accent} supervisor-schools__card--editing`}
        style={
          {
            '--school-accent': `var(--accent-${accent}-text)`,
            '--school-accent-surface': `var(--accent-${accent}-surface)`,
            '--school-accent-bg': `var(--accent-${accent}-bg)`,
          } as CSSProperties
        }
      >
        <div className="supervisor-schools__card-accent" aria-hidden="true" />
        <SchoolEditForm
          key={school.id}
          school={school}
          saving={saving}
          onCancel={onCancelEdit}
          onSave={(data) => onSaveEdit(school, data)}
        />
      </div>
    );
  }

  return (
    <div
      className={`supervisor-schools__card supervisor-schools__card--${accent} ${
        isTransitioning ? 'supervisor-schools__card--transitioning' : ''
      } ${confirming ? 'supervisor-schools__card--confirming' : ''}`}
      style={
        {
          '--school-accent': `var(--accent-${accent}-text)`,
          '--school-accent-surface': `var(--accent-${accent}-surface)`,
          '--school-accent-bg': `var(--accent-${accent}-bg)`,
        } as CSSProperties
      }
    >
      <div className="supervisor-schools__card-accent" aria-hidden="true" />
      {confirming ? (
        <div className="supervisor-schools__confirm" role="alertdialog" aria-label="Confirmar eliminación">
          <p className="supervisor-schools__confirm-text">
            ¿Eliminar {school.nombre}? Esta acción no se puede deshacer.
          </p>
          <div className="supervisor-schools__confirm-actions">
            <button
              className="supervisor-schools__confirm-btn supervisor-schools__confirm-btn--cancel"
              onClick={(e) => {
                e.preventDefault();
                onRequestDelete(school);
              }}
            >
              Cancelar
            </button>
            <button
              className="supervisor-schools__confirm-btn supervisor-schools__confirm-btn--danger"
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete(school);
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        <>
          <Link viewTransition to={to} className="supervisor-schools__card-link">
            <div className="supervisor-schools__card-icon">
              <School size={24} strokeWidth={1.5} />
            </div>
            <div className="supervisor-schools__card-content">
              <h4 className="supervisor-schools__card-name">{school.nombre}</h4>
              <span className="supervisor-schools__card-turno">{school.turno}</span>
            </div>
            <div className="supervisor-schools__card-stats">
              <span className="supervisor-schools__card-stat" title="Asistencias hoy">
                <ClipboardCheck size={12} strokeWidth={2} />
                {att}
              </span>
              <span className="supervisor-schools__card-stat" title="Novedades hoy">
                <Newspaper size={12} strokeWidth={2} />
                {nov}
              </span>
              <span className="supervisor-schools__card-stat" title="Incidentes hoy">
                <AlertTriangle size={12} strokeWidth={2} />
                {inc}
              </span>
            </div>
            <span className="supervisor-schools__card-arrow">→</span>
          </Link>
          <div className="supervisor-schools__card-actions">
            <button
              className="supervisor-schools__card-btn"
              title="Editar"
              onClick={(e) => {
                e.preventDefault();
                onEdit(school);
              }}
            >
              <Pencil size={14} strokeWidth={1.5} />
            </button>
            <button
              className="supervisor-schools__card-btn supervisor-schools__card-btn--danger"
              title="Eliminar"
              onClick={(e) => {
                e.preventDefault();
                onRequestDelete(school);
              }}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SupervisorSchools = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const haptic = useHaptic();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);

  const [attListRef] = useAutoAnimate();
  const [newsListRef] = useAutoAnimate();
  const [incListRef] = useAutoAnimate();
  const [schoolGridRef] = useAutoAnimate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { nombre: '', turno: TURNOS[0], direccion: '' },
  });

  const loadSchools = async () => {
    try {
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch {
      setError('No se pudieron cargar los datos. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    const unsubAttendances = subscribeTodayAttendances((data) => {
      setRecentAttendances(data.slice(0, 10));
    });
    const unsubNews = subscribeTodayNews((data) => {
      setRecentNews(data.slice(0, 10));
    });
    const unsubIncidents = subscribeTodayIncidents((data) => {
      setRecentIncidents(data.slice(0, 10));
    });
    return () => {
      unsubAttendances();
      unsubNews();
      unsubIncidents();
    };
  }, []);

  const onSubmit = async (data: SchoolFormData) => {
    try {
      await addSchool({
        nombre: data.nombre.trim(),
        turno: data.turno,
        direccion: data.direccion?.trim() || undefined,
      });
      addToast('success', 'Escuela creada correctamente.');
      haptic.success();
      reset();
      setShowForm(false);
      await loadSchools();
    } catch {
      addToast('error', 'Error al guardar la escuela. Intentá de nuevo.');
    }
  };

  const handleEdit = (school: SchoolType) => {
    setEditingId(school.id);
    setConfirmDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (school: SchoolType, data: SchoolFormData) => {
    setEditingSaving(true);
    try {
      await updateSchool(school.id, {
        nombre: data.nombre,
        turno: data.turno,
        direccion: data.direccion,
      });
      addToast('success', 'Escuela actualizada correctamente.');
      haptic.success();
      setEditingId(null);
      await loadSchools();
    } catch {
      addToast('error', 'Error al guardar la escuela. Intentá de nuevo.');
    } finally {
      setEditingSaving(false);
    }
  };

  const handleRequestDelete = (school: SchoolType) => {
    // Primer toque: entrar en modo confirmación en la tarjeta.
    setConfirmDeleteId((current) => (current === school.id ? null : school.id));
  };

  const handleConfirmDelete = async (school: SchoolType) => {
    setConfirmDeleteId(null);
    try {
      await deleteSchool(school.id);
      addToast('success', 'Escuela eliminada.');
      await loadSchools();
    } catch {
      addToast('error', 'No se pudo eliminar la escuela.');
    }
  };

  const countBySchool = (items: { escuelaId: string }[]) => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.escuelaId] = (map[item.escuelaId] || 0) + 1;
    });
    return map;
  };

  const attBySchool = countBySchool(recentAttendances);
  const newsBySchool = countBySchool(recentNews);
  const incBySchool = countBySchool(recentIncidents);

  const schoolsWithAttendance = new Set(Object.keys(attBySchool));
  const pendingSchools = schools.filter((s) => !schoolsWithAttendance.has(s.id));
  const coveragePercent =
    schools.length > 0 ? Math.round((schoolsWithAttendance.size / schools.length) * 100) : 0;

  return (
    <>
      <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Escuelas' }]} />
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">Panel de Supervisión</h2>
      </div>
      <p className="supervisor__subtitle">
        {schools.length} escuelas registradas · Seleccioná una para ver su información.
      </p>

      <div className="supervisor-schools__actions">
        <button
          className="supervisor-schools__add-btn"
          onClick={() => {
            reset();
            setShowForm(!showForm);
          }}
        >
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? 'Cancelar' : 'Nueva escuela'}
        </button>

        <Link viewTransition to="/supervisor/usuarios" className="supervisor-schools__users-link">
          <Settings size={16} strokeWidth={1.5} />
          Usuarios
        </Link>
      </div>

      <div className="supervisor-schools__backup">
        <div className="supervisor-schools__backup-header">
          <div className="supervisor-schools__backup-icon">
            <Download size={18} strokeWidth={1.5} />
          </div>
          <div className="supervisor-schools__backup-info">
            <h3 className="supervisor-schools__backup-title">Exportación de datos</h3>
            <p className="supervisor-schools__backup-desc">
              Ingresá a cada escuela y usá la opción "Exportar" del historial para descargar sus
              registros en CSV. El respaldo global fue reemplazado por esta forma de descarga por
              escuela, más confiable.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="supervisor-schools__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="supervisor-schools__form-row">
            <label className="supervisor-schools__label">
              Nombre *
              <input
                className="supervisor-schools__input"
                type="text"
                placeholder="Ej: Escuela N° 1"
                {...register('nombre')}
              />
              {errors.nombre && (
                <span className="supervisor-schools__error">{errors.nombre.message}</span>
              )}
            </label>
            <label className="supervisor-schools__label">
              Turno
              <select className="supervisor-schools__select" {...register('turno')}>
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
              placeholder="Ej: Av. Principal 1234"
              {...register('direccion')}
            />
          </label>

          <Button type="submit" loading={isSubmitting} className="supervisor-schools__submit">
            Crear escuela
          </Button>
        </form>
      )}

      {isLoading && <SupervisorSchoolsSkeleton />}

      {error && <div className="supervisor__loading supervisor__loading--error">{error}</div>}

      {!isLoading && !error && schools.length === 0 && (
        <div className="animate-fade-in">
          <EmptyState
            icon="school"
            title="No hay escuelas registradas"
            description="Creá la primera escuela para comenzar a cargar datos."
            action={{ label: 'Crear la primera escuela', onClick: () => setShowForm(true) }}
          />
        </div>
      )}

      {!isLoading && !error && schools.length > 0 && (
        <div className="animate-fade-in">
          <div className="supervisor-schools__summary">
            <div className="supervisor-schools__summary-card">
              <div className="supervisor-schools__summary-header">
                <div className="supervisor-schools__summary-icon supervisor-schools__summary-icon--asistencia">
                  <ClipboardCheck size={20} strokeWidth={1.5} />
                </div>
                <div className="supervisor-schools__summary-info">
                  <span className="supervisor-schools__summary-title">Asistencias</span>
                  <LiveCount value={recentAttendances.length} suffix="hoy" />
                </div>
              </div>
              <div className="supervisor-schools__summary-list" ref={attListRef}>
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
                  <LiveCount value={recentNews.length} suffix="hoy" />
                </div>
              </div>
              <div className="supervisor-schools__summary-list" ref={newsListRef}>
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
                  <LiveCount value={recentIncidents.length} suffix="hoy" />
                </div>
              </div>
              <div className="supervisor-schools__summary-list" ref={incListRef}>
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

          <section
            className="supervisor-schools__coverage"
            aria-label="Cobertura diaria de asistencias"
          >
            <div className="supervisor-schools__coverage-head">
              <div>
                <h3 className="supervisor-schools__section-title supervisor-schools__coverage-title">
                  Cobertura diaria de asistencias
                </h3>
                <p className="supervisor-schools__coverage-sub">
                  {schoolsWithAttendance.size} de {schools.length} escuelas cargaron asistencia hoy
                  ({coveragePercent}%).
                </p>
              </div>
              <span className="supervisor-schools__coverage-badge">{coveragePercent}%</span>
            </div>
            <div className="supervisor-schools__coverage-bar" role="presentation">
              <span
                className="supervisor-schools__coverage-fill"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
            {pendingSchools.length > 0 && (
              <div className="supervisor-schools__coverage-pending">
                <span className="supervisor-schools__coverage-pending-label">
                  Faltan cargar hoy:
                </span>
                <div className="supervisor-schools__coverage-pending-list">
                  {pendingSchools.map((s) => (
                    <Link
                      key={s.id}
                      viewTransition
                      to={`/supervisor/escuela/${s.id}`}
                      className="supervisor-schools__coverage-pending-item"
                    >
                      {s.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <h3 className="supervisor-schools__section-title">Escuelas</h3>
          <div className="supervisor-schools__grid" ref={schoolGridRef}>
            {schools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                att={attBySchool[school.id] || 0}
                nov={newsBySchool[school.id] || 0}
                inc={incBySchool[school.id] || 0}
                confirming={confirmDeleteId === school.id}
                editing={editingId === school.id}
                saving={editingSaving}
                onEdit={handleEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorSchools;
