import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsersBySchool, addAttendance } from '@/services/api/firestore';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import AttendanceRow from '@/components/common/AttendanceRow/AttendanceRow';
import type { UserProfile } from '@/types';
import './Asistencia.css';

interface AttendanceEntry {
  nombre: string;
  cargo: string;
  presente: boolean;
  motivo: string;
}

const Asistencia = () => {
  const { user, profile } = useAuth();
  const [escuelaId, setEscuelaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState<AttendanceEntry[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMembers = useCallback(async (schoolId: string) => {
    if (!schoolId) {
      setMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const users: UserProfile[] = await getUsersBySchool(schoolId);
      const entries: AttendanceEntry[] = users.map((u) => ({
        nombre: u.nombre,
        cargo: u.cargo,
        presente: true,
        motivo: '',
      }));
      setMembers(entries);
      setErrors({});
    } catch {
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const handleSchoolChange = useCallback(
    (schoolId: string) => {
      setEscuelaId(schoolId);
      loadMembers(schoolId);
    },
    [loadMembers]
  );

  const handleToggle = (index: number, presente: boolean) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, presente, motivo: presente ? '' : m.motivo } : m))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleMotivoChange = (index: number, motivo: string) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, motivo } : m)));
    if (motivo.trim().length >= 3) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<number, string> = {};
    let hasError = false;

    if (!escuelaId) {
      setFeedback({ type: 'error', message: 'Seleccioná una escuela.' });
      return false;
    }

    members.forEach((m, i) => {
      if (!m.presente && m.motivo.trim().length < 3) {
        newErrors[i] = 'Mínimo 3 caracteres';
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate() || !user || !profile) return;

    setIsSubmitting(true);
    try {
      await addAttendance({
        escuelaId,
        fecha: new Date(fecha),
        cargadoPor: user.uid,
        cargadoPorNombre: profile.nombre,
        registros: members.map((m) => ({
          nombre: m.nombre,
          cargo: m.cargo,
          presente: m.presente,
          motivo: m.presente ? undefined : m.motivo,
        })),
      });

      setFeedback({ type: 'success', message: 'Asistencia registrada correctamente.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error al registrar la asistencia. Intentá de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentes = members.filter((m) => m.presente).length;
  const ausentes = members.filter((m) => !m.presente).length;

  return (
    <section className="asistencia">
      <h2 className="asistencia__title">Registrar Asistencia</h2>
      <p className="asistencia__subtitle">
        Cargá la asistencia del personal de gestión para el día seleccionado.
      </p>

      <form className="asistencia__form" onSubmit={handleSubmit}>
        <div className="asistencia__row">
          <SchoolSelect value={escuelaId} onChange={handleSchoolChange} />
          <DatePicker value={fecha} onChange={setFecha} />
        </div>

        {escuelaId && (
          <>
            {isLoadingMembers ? (
              <div className="asistencia__loading">Cargando integrantes...</div>
            ) : members.length === 0 ? (
              <div className="asistencia__empty">
                No se encontraron integrantes para esta escuela.
              </div>
            ) : (
              <>
                <div className="asistencia__summary">
                  <span className="asistencia__summary-item asistencia__summary-item--total">
                    Total: {members.length}
                  </span>
                  <span className="asistencia__summary-item asistencia__summary-item--present">
                    Presentes: {presentes}
                  </span>
                  <span className="asistencia__summary-item asistencia__summary-item--absent">
                    Ausentes: {ausentes}
                  </span>
                </div>

                <div className="asistencia__list">
                  {members.map((member, index) => (
                    <AttendanceRow
                      key={`${member.nombre}-${index}`}
                      nombre={member.nombre}
                      cargo={member.cargo}
                      presente={member.presente}
                      motivo={member.motivo}
                      motivoError={errors[index]}
                      onToggle={(p) => handleToggle(index, p)}
                      onMotivoChange={(m) => handleMotivoChange(index, m)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {feedback && (
          <div
            className={`asistencia__feedback asistencia__feedback--${feedback.type}`}
            role="alert"
          >
            {feedback.message}
          </div>
        )}

        {members.length > 0 && (
          <button
            type="submit"
            className="asistencia__submit"
            disabled={isSubmitting || isLoadingMembers}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
        )}
      </form>
    </section>
  );
};

export default Asistencia;
