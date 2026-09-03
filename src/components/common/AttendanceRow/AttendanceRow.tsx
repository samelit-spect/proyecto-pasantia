import { memo } from 'react';
import './AttendanceRow.css';

interface AttendanceRowProps {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo: string;
  onToggle: (presente: boolean) => void;
  onMotivoChange: (motivo: string) => void;
  motivoError?: string;
  nombreEditable?: boolean;
  onNombreChange?: (nombre: string) => void;
  onRemove?: () => void;
}

const AttendanceRow = ({
  nombre,
  cargo,
  presente,
  motivo,
  onToggle,
  onMotivoChange,
  motivoError,
  nombreEditable = false,
  onNombreChange,
  onRemove,
}: AttendanceRowProps) => {
  return (
    <div className={`attendance-row ${!presente ? 'attendance-row--absent' : ''}`}>
      <div className="attendance-row__info">
        {nombreEditable && onNombreChange ? (
          <input
            name="nombre-docente"
            type="text"
            className="attendance-row__name-input"
            value={nombre}
            placeholder={cargo}
            onChange={(e) => onNombreChange(e.target.value)}
          />
        ) : (
          <span className="attendance-row__name">{nombre}</span>
        )}
        <span className="attendance-row__role">{cargo}</span>
      </div>

      <div className="attendance-row__actions">
        <label className="attendance-row__toggle">
          <input type="checkbox" checked={presente} onChange={(e) => onToggle(e.target.checked)} />
          <span
            key={presente ? 'presente' : 'ausente'}
            className={`attendance-row__toggle-label attendance-row__toggle-label--${presente ? 'presente' : 'ausente'}`}
          >
            {presente ? 'Presente' : 'Ausente'}
          </span>
        </label>

        {!presente && (
          <div className="attendance-row__motivo">
            <input
              name="motivo-ausencia"
              type="text"
              className={`attendance-row__motivo-input ${motivoError ? 'attendance-row__motivo-input--error' : ''}`}
              placeholder="Motivo de ausencia..."
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
            />
            {motivoError && <span className="attendance-row__motivo-error">{motivoError}</span>}
          </div>
        )}

        {onRemove && (
          <button
            type="button"
            className="attendance-row__remove"
            onClick={onRemove}
            title="Quitar integrante"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(AttendanceRow);
