import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useViewTransitionState } from 'react-router-dom';
import { ArrowLeft, CalendarDays, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import SchoolDetailAttendances from '@/components/supervisor/SchoolDetailAttendances/SchoolDetailAttendances';
import SchoolDetailNews from '@/components/supervisor/SchoolDetailNews/SchoolDetailNews';
import SchoolDetailIncidents from '@/components/supervisor/SchoolDetailIncidents/SchoolDetailIncidents';
import SchoolDetailUsers from '@/components/supervisor/SchoolDetailUsers/SchoolDetailUsers';
import SchoolDetailDocentes from '@/components/supervisor/SchoolDetailDocentes/SchoolDetailDocentes';
import SchoolDetailFotos from '@/components/supervisor/SchoolDetailFotos/SchoolDetailFotos';
import SchoolDetailToday from '@/components/supervisor/SchoolDetailToday/SchoolDetailToday';
import SchoolDetailFeedback from '@/components/supervisor/SchoolDetailFeedback/SchoolDetailFeedback';
import Lightbox from '@/components/supervisor/Lightbox/Lightbox';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SupervisorDetailSkeleton } from './SupervisorSkeleton';
import { useSchoolDetailData } from '@/hooks/useSchoolDetailData';
import './SupervisorSchoolDetail.css';

const SupervisorSchoolDetail = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const {
    isLoading,
    error,
    school,
    users,
    docentes,
    filteredAttendances,
    filteredNews,
    filteredIncidents,
    filteredDocenteAttendances,
    filteredFotos,
    todayAttendances,
    todayNews,
    todayIncidents,
    todayDocenteAttendances,
    expandedSection,
    viewMode,
    setViewMode,
    toggleSection,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    lightbox,
    setLightbox,
    exporting,
    confirmDeleteFoto,
    setConfirmDeleteFoto,
    statusOp,
    verifyOp,
    fotoOp,
    exportOp,
    docenteOp,
    docenteFormNombre,
    setDocenteFormNombre,
    docenteFormMateria,
    setDocenteFormMateria,
    docenteFormSubmitting,
    editingDocente,
    handleAddDocente,
    handleEditDocente,
    handleToggleDocente,
    handleStatusChange,
    handleVerifyAttendance,
    handleVerifyDocenteAttendance,
    handleExport,
    handleDeleteFotoConfirm,
  } = useSchoolDetailData({ schoolId, profile });

  // True mientras la navegación entrante proviene del click en una card de escuela.
  const isEnteringViaCard = useViewTransitionState(`/supervisor/escuela/${schoolId}`);

  if (isLoading) {
    return <SupervisorDetailSkeleton />;
  }

  if (error) {
    return <div className="supervisor__loading supervisor__loading--error">{error}</div>;
  }

  if (!school) {
    return <div className="supervisor__empty">Escuela no encontrada.</div>;
  }

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Escuelas', to: '/supervisor' },
          { label: school.nombre },
        ]}
      />
      <div className={`supervisor__header ${isEnteringViaCard ? 'supervisor__header--hero' : ''}`}>
        <button
          className="supervisor__header-back"
          onClick={() => navigate('/supervisor', { viewTransition: true })}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">{school.nombre}</h2>
      </div>
      <p className="supervisor__subtitle">
        Turno: {school.turno} · {users.length} usuarios · {docentes.length} docentes
      </p>

      <SchoolDetailFeedback feedback={statusOp.feedback} />
      <SchoolDetailFeedback feedback={verifyOp.feedback} />
      <SchoolDetailFeedback feedback={fotoOp.feedback} />
      <SchoolDetailFeedback feedback={exportOp.feedback} />

      <div className="supervisor-detail__tabs" role="tablist">
        <span
          className="supervisor-detail__tab-indicator"
          data-view={viewMode}
          aria-hidden="true"
        />
        <button
          id="supervisor-detail-tab-hoy"
          role="tab"
          aria-selected={viewMode === 'hoy'}
          aria-controls="supervisor-detail-panel-hoy"
          className={`supervisor-detail__tab ${viewMode === 'hoy' ? 'supervisor-detail__tab--active' : ''}`}
          onClick={() => setViewMode('hoy')}
        >
          <CalendarDays size={15} strokeWidth={1.5} />
          Hoy
        </button>
        <button
          id="supervisor-detail-tab-historico"
          role="tab"
          aria-selected={viewMode === 'historico'}
          aria-controls="supervisor-detail-panel-historico"
          className={`supervisor-detail__tab ${viewMode === 'historico' ? 'supervisor-detail__tab--active' : ''}`}
          onClick={() => setViewMode('historico')}
        >
          <History size={15} strokeWidth={1.5} />
          Histórico
        </button>
      </div>

      {viewMode === 'hoy' && (
        <div
          id="supervisor-detail-panel-hoy"
          role="tabpanel"
          aria-labelledby="supervisor-detail-tab-hoy"
          className="supervisor-detail__view animate-fade-in"
        >
          <SchoolDetailToday
            attendances={todayAttendances}
            docenteAttendances={todayDocenteAttendances}
            news={todayNews}
            incidents={todayIncidents}
          />
        </div>
      )}

      {viewMode === 'historico' && (
        <div
          id="supervisor-detail-panel-historico"
          role="tabpanel"
          aria-labelledby="supervisor-detail-tab-historico"
          className="supervisor-detail__view animate-fade-in"
        >
          <div className="supervisor-detail__filters">
            <DatePicker label="Desde" value={dateFrom} onChange={setDateFrom} />
            <DatePicker label="Hasta" value={dateTo} onChange={setDateTo} />
            {(dateFrom || dateTo) && (
              <button
                className="supervisor-detail__filters-clear"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="supervisor-detail__sections">
            <SchoolDetailAttendances
              sectionId="asistencias"
              title="Asistencia de gestión"
              records={filteredAttendances}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('asistencias')}
              onVerify={handleVerifyAttendance}
              verifyUpdatingId={verifyOp.updatingId}
              onExport={() => handleExport('asistencias')}
              exporting={exporting === 'asistencias'}
            />

            <SchoolDetailAttendances
              sectionId="asistencia-docentes"
              title="Asistencia del profesorado"
              records={filteredDocenteAttendances}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('asistencia-docentes')}
              onVerify={handleVerifyDocenteAttendance}
              verifyUpdatingId={verifyOp.updatingId}
              onExport={() => handleExport('docentes')}
              exporting={exporting === 'docentes'}
            />

            <SchoolDetailNews
              news={filteredNews}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('novedades')}
              onExport={() => handleExport('novedades')}
              exporting={exporting === 'novedades'}
            />

            <SchoolDetailIncidents
              incidents={filteredIncidents}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('incidentes')}
              onStatusChange={handleStatusChange}
              statusUpdatingId={statusOp.updatingId}
              onLightbox={setLightbox}
              onExport={() => handleExport('incidentes')}
              exporting={exporting === 'incidentes'}
            />

            <SchoolDetailUsers
              users={users}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('usuarios')}
            />

            <SchoolDetailDocentes
              docentes={docentes}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('docentes')}
              formNombre={docenteFormNombre}
              formMateria={docenteFormMateria}
              formSubmitting={docenteFormSubmitting}
              feedback={docenteOp.feedback}
              updatingId={docenteOp.updatingId}
              onNombreChange={setDocenteFormNombre}
              onMateriaChange={setDocenteFormMateria}
              onSubmit={handleAddDocente}
              onToggleDocente={handleToggleDocente}
              onEditDocente={handleEditDocente}
              isEditing={!!editingDocente}
            />

            <SchoolDetailFotos
              fotos={filteredFotos}
              expandedSection={expandedSection ?? ''}
              onToggle={() => toggleSection('fotos')}
              onLightbox={setLightbox}
              onDelete={(fotoId) => setConfirmDeleteFoto(fotoId)}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDeleteFoto}
        title="Eliminar foto"
        message="¿Seguro que querés eliminar esta foto?"
        confirmLabel="Eliminar"
        onConfirm={handleDeleteFotoConfirm}
        onCancel={() => setConfirmDeleteFoto(null)}
      />
    </div>
  );
};

export default SupervisorSchoolDetail;
