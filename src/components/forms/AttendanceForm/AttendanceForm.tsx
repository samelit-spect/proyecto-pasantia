import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import HolidayNotice from '@/components/common/HolidayNotice/HolidayNotice';
import AttendanceRow from '@/components/common/AttendanceRow/AttendanceRow';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import { CheckCircle2, XCircle } from 'lucide-react';
import { todayISO } from '@/utils/validation';
import { markOfflineWrite } from '@/utils/offlineQueue';
import { friendlyFirestoreError } from '@/utils/firestoreErrors';
import './AttendanceForm.css';

export interface AttendanceFormEntry {
  id: string;
  nombre: string;
  cargo: string;
  label: string;
  presente: boolean;
  motivo: string;
  existe: boolean;
}

export interface AttendanceFormRecord {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo?: string;
  existe?: boolean;
}

export interface AttendanceSectionDef {
  cargo: string;
  label: string;
  multiple?: boolean;
  required?: boolean;
}

interface AttendanceFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  mode: 'sections' | 'list';
  sections?: AttendanceSectionDef[];
  loadEntries?: (schoolId: string) => Promise<Omit<AttendanceFormEntry, 'id'>[]>;
  checkDuplicate: (escuelaId: string, fecha: Date) => Promise<boolean>;
  onSubmit: (data: {
    escuelaId: string;
    fecha: Date;
    registros: AttendanceFormRecord[];
  }) => Promise<void>;
}

const AttendanceForm = ({
  title,
  subtitle,
  submitLabel,
  mode,
  sections = [],
  loadEntries,
  checkDuplicate,
  onSubmit,
}: AttendanceFormProps) => {
  const { user, profile } = useAuth();
  const entrySeqRef = useRef(0);
  const nextId = () => `entry-${++entrySeqRef.current}`;
  const [fecha, setFecha] = useState(todayISO());
  const [entries, setEntries] = useState<AttendanceFormEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(sections);
  const loadEntriesRef = useRef(loadEntries);

  useEffect(() => {
    sectionsRef.current = sections;
  });
  useEffect(() => {
    loadEntriesRef.current = loadEntries;
  });

  useEffect(() => {
    if (!result) return;
    modalRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResult(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [result]);

  const escuelaId = profile?.escuelaId || '';

  useEffect(() => {
    if (!escuelaId) return;

    setErrors({});
    setResult(null);

    if (mode === 'sections') {
      setEntries(
        sectionsRef.current.map((s) => ({
          id: nextId(),
          nombre: profile && s.cargo === profile.rol ? profile.nombre : '',
          cargo: s.cargo,
          label: s.label,
          presente: true,
          motivo: '',
          existe: true,
        }))
      );
      return;
    }

    setIsLoading(true);
    (loadEntriesRef.current?.(escuelaId) ?? Promise.resolve([]))
      .then((list) => setEntries(list.map((e) => ({ ...e, id: nextId() }))))
      .catch(() => setEntries([]))
      .finally(() => setIsLoading(false));
  }, [escuelaId, mode, profile]);

  const addRow = (cargo: string, label: string) => {
    setEntries((prev) => [
      ...prev,
      { id: nextId(), nombre: '', cargo, label, presente: true, motivo: '', existe: true },
    ]);
  };

  const removeRow = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleToggle = (id: string, presente: boolean) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, presente, motivo: presente ? '' : e.motivo } : e))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleExisteToggle = (id: string, existe: boolean) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, existe, presente: existe ? e.presente : true, motivo: existe ? e.motivo : '' }
          : e
      )
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleMotivoChange = (id: string, motivo: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, motivo } : e)));
    if (motivo.trim().length >= 3) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleNombreChange = (id: string, nombre: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, nombre } : e)));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    if (!escuelaId) {
      setResult({ type: 'error', message: 'No tenés una escuela asignada.' });
      return false;
    }

    if (fecha > todayISO()) {
      setResult({ type: 'error', message: 'La fecha no puede ser en el futuro.' });
      return false;
    }

    const countByCargo = new Map<string, number>();
    entries.forEach((e) => countByCargo.set(e.cargo, (countByCargo.get(e.cargo) ?? 0) + 1));

    entries.forEach((e) => {
      if (!e.existe) return;
      if (!e.presente && e.motivo.trim().length < 3) {
        newErrors[e.id] = 'Ingresá el motivo';
        hasError = true;
      }
      if (mode === 'sections' && (countByCargo.get(e.cargo) ?? 0) > 1 && e.nombre.trim() === '') {
        newErrors[e.id] = 'Ingresá el nombre';
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!validate() || !user || !profile) return;

    const savedOffline = !navigator.onLine;

    setIsSubmitting(true);
    try {
      let existing = false;
      try {
        existing = await checkDuplicate(escuelaId, new Date(fecha));
      } catch (err) {
        console.error('Error verificando duplicado:', err);
        setResult({
          type: 'error',
          message: 'No se pudo verificar si ya existe un registro. Verificá tu conexión.',
        });
        return;
      }

      if (existing) {
        setResult({
          type: 'error',
          message: 'Ya cargaste la asistencia de esta escuela para esa fecha.',
        });
        return;
      }

      await onSubmit({
        escuelaId,
        fecha: new Date(fecha),
        registros: entries.map((m) => {
          const registro: AttendanceFormRecord = {
            nombre: m.nombre.trim() || m.label,
            cargo: m.cargo,
            presente: m.existe ? m.presente : false,
            existe: m.existe,
          };
          if (!m.existe) {
            registro.motivo = 'No existe el cargo en esta escuela';
          } else if (!m.presente) {
            registro.motivo = m.motivo;
          }
          return registro;
        }),
      });

      if (savedOffline) markOfflineWrite();

      setResult({
        type: 'success',
        message: savedOffline
          ? 'Sin conexión: asistencia guardada en el dispositivo. Se sincronizará automáticamente al volver internet.'
          : 'Asistencia enviada correctamente.',
      });
    } catch (err) {
      console.error('Error al enviar asistencia:', err);
      setResult({
        type: 'error',
        message: friendlyFirestoreError(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentes = entries.filter((m) => m.existe && m.presente).length;
  const ausentes = entries.filter((m) => m.existe && !m.presente).length;
  const noExistentes = entries.filter((m) => !m.existe).length;

  return (
    <section className="attendance-form">
      <h2 className="attendance-form__title">{title}</h2>
      <p className="attendance-form__subtitle">{subtitle}</p>

      <form className="attendance-form__card" onSubmit={handleSubmit}>
        <div className="attendance-form__row">
          <div className="attendance-form__school-info">
            <span className="attendance-form__school-label">Escuela:</span>
            <span className="attendance-form__school-name">
              {profile?.escuelaId ? 'Tu escuela asignada' : 'Sin escuela asignada'}
            </span>
          </div>
          <DatePicker value={fecha} onChange={setFecha} />
        </div>

        <HolidayNotice fecha={fecha} />

        {escuelaId && (
          <>
            {isLoading ? (
              <div className="attendance-form__loading">Cargando integrantes...</div>
            ) : entries.length === 0 ? (
              <div className="attendance-form__empty">
                <EmptyState
                  icon="users"
                  title="Sin integrantes"
                  description={
                    mode === 'list'
                      ? 'No se encontraron integrantes. Podés agregarlos con el botón + Agregar.'
                      : 'No se encontraron integrantes para esta escuela.'
                  }
                />
              </div>
            ) : (
              <>
                <div className="attendance-form__summary">
                  <span className="attendance-form__summary-item attendance-form__summary-item--total">
                    Total: {entries.length}
                  </span>
                  <span className="attendance-form__summary-item attendance-form__summary-item--present">
                    Presentes: {presentes}
                  </span>
                  <span className="attendance-form__summary-item attendance-form__summary-item--absent">
                    Ausentes: {ausentes}
                  </span>
                  {noExistentes > 0 && (
                    <span className="attendance-form__summary-item attendance-form__summary-item--none">
                      Sin cargo: {noExistentes}
                    </span>
                  )}
                </div>

                {mode === 'sections' ? (
                  <div className="attendance-form__sections">
                    {sections.map((s) => {
                      const rows = entries.filter((e) => e.cargo === s.cargo);
                      if (rows.length === 0) return null;
                      return (
                        <div key={s.cargo} className="attendance-form__section">
                          <div className="attendance-form__section-header">
                            <span className="attendance-form__section-title">{s.label}</span>
                            <div className="attendance-form__section-actions">
                              {s.required === false && (
                                <label className="attendance-form__existe-toggle">
                                  <input
                                    type="checkbox"
                                    checked={rows[0]?.existe ?? true}
                                    onChange={(e) => {
                                      if (rows[0]) handleExisteToggle(rows[0].id, e.target.checked);
                                    }}
                                  />
                                  <span className="attendance-form__existe-label">Existe</span>
                                </label>
                              )}
                              {s.multiple && (rows[0]?.existe ?? true) && (
                                <button
                                  type="button"
                                  className="attendance-form__section-add"
                                  onClick={() => addRow(s.cargo, s.label)}
                                >
                                  + Agregar
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="attendance-form__section-rows">
                            {rows.map((m) => (
                              <AttendanceRow
                                key={m.id}
                                nombre={m.nombre}
                                cargo={m.label}
                                presente={m.presente}
                                motivo={m.motivo}
                                motivoError={errors[m.id]}
                                existe={m.existe}
                                nombreEditable
                                onNombreChange={(n) => handleNombreChange(m.id, n)}
                                onToggle={(p) => handleToggle(m.id, p)}
                                onMotivoChange={(mot) => handleMotivoChange(m.id, mot)}
                                onRemove={
                                  s.multiple && rows.length > 1 ? () => removeRow(m.id) : undefined
                                }
                              />
                            ))}
                          </div>
                          {s.multiple && (rows[0]?.existe ?? true) && (
                            <button
                              type="button"
                              className="attendance-form__section-add attendance-form__section-add--below"
                              onClick={() => addRow(s.cargo, s.label)}
                            >
                              + Agregar {s.label.toLowerCase()}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="attendance-form__list">
                    {entries.map((m) => (
                      <AttendanceRow
                        key={m.id}
                        nombre={m.nombre}
                        cargo={m.label}
                        presente={m.presente}
                        motivo={m.motivo}
                        motivoError={errors[m.id]}
                        nombreEditable
                        onNombreChange={(n) => handleNombreChange(m.id, n)}
                        onToggle={(p) => handleToggle(m.id, p)}
                        onMotivoChange={(mot) => handleMotivoChange(m.id, mot)}
                        onRemove={entries.length > 1 ? () => removeRow(m.id) : undefined}
                      />
                    ))}
                    <button
                      type="button"
                      className="attendance-form__add"
                      onClick={() => addRow('docente', 'Docente')}
                    >
                      + Agregar integrante
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {entries.length > 0 && (
          <button
            type="submit"
            className="attendance-form__submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Enviando...' : submitLabel}
          </button>
        )}
      </form>

      {result && (
        <div
          className="attendance-form__overlay"
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Resultado del envío"
        >
          <div className={`attendance-form__modal attendance-form__modal--${result.type}`}>
            {result.type === 'success' ? (
              <CheckCircle2
                size={40}
                strokeWidth={1.5}
                className="attendance-form__modal-icon attendance-form__modal-icon--success"
              />
            ) : (
              <XCircle
                size={40}
                strokeWidth={1.5}
                className="attendance-form__modal-icon attendance-form__modal-icon--error"
              />
            )}
            <p className="attendance-form__modal-message">{result.message}</p>
            <button
              type="button"
              className="attendance-form__modal-btn"
              onClick={() => setResult(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AttendanceForm;
