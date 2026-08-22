import { useState, useEffect } from 'react';
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
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { exportAllData } from '@/utils/exportAll';
import { SupervisorSchoolsSkeleton } from './SupervisorSkeleton';
import './SupervisorSchools.css';

const TURNOS = ['mañana', 'tarde', 'vespertino', 'nocturno'] as const;

const schoolSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  turno: z.enum(TURNOS),
  direccion: z.string().optional(),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const SupervisorSchools = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SchoolType | null>(null);

  const [backupDateFrom, setBackupDateFrom] = useState('');
  const [backupDateTo, setBackupDateTo] = useState('');
  const [confirmExport, setConfirmExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressLabel, setExportProgressLabel] = useState('');

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
      if (editingSchool) {
        await updateSchool(editingSchool.id, {
          nombre: data.nombre.trim(),
          turno: data.turno,
          direccion: data.direccion?.trim() || undefined,
        });
        addToast('success', 'Escuela actualizada correctamente.');
      } else {
        await addSchool({
          nombre: data.nombre.trim(),
          turno: data.turno,
          direccion: data.direccion?.trim() || undefined,
        });
        addToast('success', 'Escuela creada correctamente.');
      }
      reset();
      setEditingSchool(null);
      setShowForm(false);
      await loadSchools();
    } catch {
      addToast('error', 'Error al guardar la escuela. Intentá de nuevo.');
    }
  };

  const handleEdit = (school: SchoolType) => {
    setEditingSchool(school);
    reset({
      nombre: school.nombre,
      turno: school.turno as SchoolFormData['turno'],
      direccion: school.direccion || '',
    });
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const school = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteSchool(school.id);
      addToast('success', 'Escuela eliminada.');
      await loadSchools();
    } catch {
      addToast('error', 'No se pudo eliminar la escuela.');
    }
  };

  const handleExportAllConfirm = async () => {
    setConfirmExport(false);
    setIsExporting(true);

    try {
      await exportAllData({
        dateFrom: backupDateFrom || undefined,
        dateTo: backupDateTo || undefined,
        onProgress: ({ label, current, total }) =>
          setExportProgressLabel(`Exportando ${label.toLowerCase()} (${current}/${total})...`),
      });
      addToast('success', 'Respaldo generado: se descargaron los archivos CSV.');
    } catch {
      addToast('error', 'No se pudo completar la exportación. Intentá de nuevo.');
    } finally {
      setIsExporting(false);
      setExportProgressLabel('');
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
            setEditingSchool(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? 'Cancelar' : editingSchool ? 'Editar escuela' : 'Nueva escuela'}
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
            <h3 className="supervisor-schools__backup-title">Respaldo de datos</h3>
            <p className="supervisor-schools__backup-desc">
              Descargá todos los registros de la jurisdicción en archivos CSV.
            </p>
          </div>
        </div>
        <div className="supervisor-schools__backup-controls">
          <DatePicker label="Desde" value={backupDateFrom} onChange={setBackupDateFrom} />
          <DatePicker label="Hasta" value={backupDateTo} onChange={setBackupDateTo} />
          <Button onClick={() => setConfirmExport(true)} loading={isExporting}>
            {exportProgressLabel || 'Exportar todo'}
          </Button>
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
            {editingSchool ? 'Actualizar' : 'Crear escuela'}
          </Button>
        </form>
      )}

      {isLoading && <SupervisorSchoolsSkeleton />}

      {error && <div className="supervisor__loading supervisor__loading--error">{error}</div>}

      {!isLoading && !error && schools.length === 0 && (
        <EmptyState
          icon="school"
          title="No hay escuelas registradas"
          description="Creá la primera escuela para comenzar a cargar datos."
        />
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
                    {recentAttendances.length} hoy
                  </span>
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
                  <span className="supervisor-schools__summary-count">{recentNews.length} hoy</span>
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
                  <span className="supervisor-schools__summary-count">
                    {recentIncidents.length} hoy
                  </span>
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

          <h3 className="supervisor-schools__section-title">Escuelas</h3>
          <div className="supervisor-schools__grid" ref={schoolGridRef}>
            {schools.map((school) => {
              const att = attBySchool[school.id] || 0;
              const nov = newsBySchool[school.id] || 0;
              const inc = incBySchool[school.id] || 0;
              return (
                <div key={school.id} className="supervisor-schools__card">
                  <Link
                    viewTransition
                    to={`/supervisor/escuela/${school.id}`}
                    className="supervisor-schools__card-link"
                  >
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
                        handleEdit(school);
                      }}
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      className="supervisor-schools__card-btn supervisor-schools__card-btn--danger"
                      title="Eliminar"
                      onClick={(e) => {
                        e.preventDefault();
                        setConfirmDelete(school);
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar escuela"
        message={`¿Eliminar la escuela "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmExport}
        title="Exportar todos los datos"
        message="Se descargarán 4 archivos CSV con los registros de todas las escuelas (asistencias, docentes, novedades e incidentes). Las fotos no se incluyen en el respaldo."
        confirmLabel="Descargar"
        variant="warning"
        onConfirm={handleExportAllConfirm}
        onCancel={() => setConfirmExport(false)}
      />
    </>
  );
};

export default SupervisorSchools;
