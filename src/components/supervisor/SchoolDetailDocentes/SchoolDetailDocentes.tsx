import { memo } from 'react';
import { Pencil } from 'lucide-react';
import type { Docente } from '@/types';
import AccordionSection from '../AccordionSection/AccordionSection';

interface SchoolDetailDocentesProps {
  docentes: Docente[];
  expandedSection: string;
  onToggle: () => void;
  formNombre: string;
  formMateria: string;
  formSubmitting: boolean;
  feedback: { type: 'success' | 'error'; message: string } | null;
  updatingId: string | null;
  onNombreChange: (v: string) => void;
  onMateriaChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleDocente: (id: string, activo: boolean) => void;
  onEditDocente?: (docente: Docente) => void;
  isEditing?: boolean;
}

const SchoolDetailDocentes = ({
  docentes,
  expandedSection,
  onToggle,
  formNombre,
  formMateria,
  formSubmitting,
  feedback,
  updatingId,
  onNombreChange,
  onMateriaChange,
  onSubmit,
  onToggleDocente,
  onEditDocente,
  isEditing,
}: SchoolDetailDocentesProps) => (
  <AccordionSection
    title="Docentes"
    count={`${docentes.length} docentes`}
    isExpanded={expandedSection === 'docentes'}
    onToggle={onToggle}
  >
    {feedback && (
      <div
        className={`supervisor-detail__feedback supervisor-detail__feedback--${feedback.type}`}
        role="status"
      >
        {feedback.message}
      </div>
    )}

    <form className="supervisor-detail__docente-form" onSubmit={onSubmit}>
      <label className="supervisor-detail__docente-field">
        Nombre
        <input
          name="nombre"
          className="supervisor-detail__docente-input"
          type="text"
          placeholder="Nombre del docente"
          value={formNombre}
          onChange={(e) => onNombreChange(e.target.value)}
        />
      </label>
      <label className="supervisor-detail__docente-field">
        Materia (opcional)
        <input
          name="materia"
          className="supervisor-detail__docente-input"
          type="text"
          placeholder="Ej: Matemática"
          value={formMateria}
          onChange={(e) => onMateriaChange(e.target.value)}
        />
      </label>
      <button type="submit" className="supervisor-detail__docente-submit" disabled={formSubmitting}>
        {formSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Agregar Docente'}
      </button>
    </form>

    {docentes.length === 0 ? (
      <div className="supervisor-sub__empty">No hay docentes cargados.</div>
    ) : (
      <div className="supervisor-detail__docente-list">
        {docentes.map((d) => (
          <div
            key={d.id}
            className={`supervisor-detail__docente ${d.activo === false ? 'supervisor-detail__docente--inactive' : ''}`}
          >
            <div className="supervisor-detail__docente-info">
              <span className="supervisor-detail__docente-name">{d.nombre}</span>
              <span className="supervisor-detail__docente-materia">{d.materia || 'Docente'}</span>
              {(d.editadoPorNombre || d.creadoPorNombre) && (
                <span className="supervisor-detail__docente-audit">
                  {d.editadoPorNombre && d.editadoEn
                    ? `Editado por ${d.editadoPorNombre} · ${d.editadoEn.toDate().toLocaleDateString('es-AR')}`
                    : d.creadoPorNombre
                      ? `Creado por ${d.creadoPorNombre}`
                      : null}
                </span>
              )}
            </div>
            <div className="supervisor-detail__docente-actions">
              {onEditDocente && (
                <button
                  className="supervisor-detail__docente-edit"
                  title="Editar"
                  onClick={() => onEditDocente(d)}
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </button>
              )}
              <button
                className="supervisor-detail__docente-toggle"
                disabled={updatingId === d.id}
                onClick={() => onToggleDocente(d.id, d.activo === false)}
              >
                {d.activo === false ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </AccordionSection>
);

export default memo(SchoolDetailDocentes);
