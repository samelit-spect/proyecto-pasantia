import { useAuth } from '@/context/AuthContext';
import { addAttendance, getAttendanceByUserAndDate } from '@/services/api/firestore';
import AttendanceForm from '@/components/forms/AttendanceForm/AttendanceForm';
import type { AttendanceSectionDef } from '@/components/forms/AttendanceForm/AttendanceForm';

const GESTION_SECTIONS: AttendanceSectionDef[] = [
  { cargo: 'director', label: 'Director', multiple: false },
  { cargo: 'vice', label: 'Vice-director', multiple: false },
  { cargo: 'preceptor', label: 'Preceptores', multiple: true },
  { cargo: 'secretario', label: 'Secretario/a', multiple: false },
  { cargo: 'conserje', label: 'Conserje', multiple: false },
];

const Asistencia = () => {
  const { user, profile } = useAuth();

  return (
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
      }}
    />
  );
};

export default Asistencia;
