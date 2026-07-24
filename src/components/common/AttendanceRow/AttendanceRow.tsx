import './AttendanceRow.css';

interface AttendanceRowProps {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo: string;
  onToggle: (presente: boolean) => void;
  onMotivoChange: (motivo: string) => void;
  motivoError?: string;
}

const AttendanceRow = ({
  nombre,
  cargo,
  presente,
  motivo,
  onToggle,
  onMotivoChange,
  motivoError,
}: AttendanceRowProps) => {
  return (
    <div className={`attendance-row ${!presente ? 'attendance-row--absent' : ''}`}>
      <div className="attendance-row__info">
        <span className="attendance-row__name">{nombre}</span>
        <span className="attendance-row__role">{cargo}</span>
      </div>

      <div className="attendance-row__actions">
        <label className="attendance-row__toggle">
          <input type="checkbox" checked={presente} onChange={(e) => onToggle(e.target.checked)} />
          <span className="attendance-row__toggle-label">{presente ? 'Presente' : 'Ausente'}</span>
        </label>

        {!presente && (
          <div className="attendance-row__motivo">
            <input
              type="text"
              className={`attendance-row__motivo-input ${motivoError ? 'attendance-row__motivo-input--error' : ''}`}
              placeholder="Motivo de ausencia..."
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
            />
            {motivoError && <span className="attendance-row__motivo-error">{motivoError}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRow;
