import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHaptic } from '@/hooks/useHaptic';
import { addAttendance, getAttendanceByUserAndDate } from '@/services/api/firestore';
import AttendanceForm from '@/components/forms/AttendanceForm/AttendanceForm';
import ContextHint from '@/components/common/ContextHint/ContextHint';
import type { AttendanceSectionDef } from '@/components/forms/AttendanceForm/AttendanceForm';

const GESTION_SECTIONS: AttendanceSectionDef[] = [
  { cargo: 'director', label: 'Director' },
  { cargo: 'vice', label: 'Vice-director', required: false },
  { cargo: 'preceptor', label: 'Preceptores', multiple: true, required: false },
  { cargo: 'secretario', label: 'Secretario/a', required: false },
  { cargo: 'conserje', label: 'Conserje', multiple: true, required: false },
];

const Asistencia = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const haptic = useHaptic();

  return (
    <>
      <button className="supervisor__back" onClick={() => navigate('/', { viewTransition: true })}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>
      <ContextHint id="asistencia-gestion">
        La asistencia se carga una vez por día. Si ya enviaste el formulario de hoy, el sistema te
        lo va a avisar antes de duplicarlo.
      </ContextHint>
      <AttendanceForm
        title="Registrar Asistencia"
        subtitle="Marcá si cada integrante de la gestión está presente o ausente. Si está ausente, el motivo es obligatorio."
        submitLabel="Enviar Asistencia"
        mode="sections"
        sections={GESTION_SECTIONS}
        checkDuplicate={async (escuelaId, fecha) => {
          if (!user) return false;
          const existing = await getAttendanceByUserAndDate(escuelaId, fecha, user.uid);
          return existing.length > 0;
        }}
        onSubmit={async ({ escuelaId, fecha, registros }) => {
          if (!user || !profile) return;
          await addAttendance({
            escuelaId,
            fecha,
            cargadoPor: user.uid,
            cargadoPorNombre: profile.nombre,
            registros,
          });
          haptic.success();
        }}
      />
    </>
  );
};

export default Asistencia;
