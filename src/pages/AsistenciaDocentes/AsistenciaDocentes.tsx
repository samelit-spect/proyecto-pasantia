import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getDocentesBySchool,
  addDocenteAttendance,
  getDocenteAttendanceByUserAndDate,
} from '@/services/api/firestore';
import AttendanceForm from '@/components/forms/AttendanceForm/AttendanceForm';
import type { Docente } from '@/types';

const AsistenciaDocentes = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <button className="supervisor__back" onClick={() => navigate('/')}>
        <ArrowLeft size={18} strokeWidth={1.5} />
        Volver
      </button>
      <AttendanceForm
      title="Asistencia de Docentes"
      subtitle="Marcá si cada docente está presente o ausente. Si está ausente, el motivo es obligatorio."
      submitLabel="Enviar Asistencia"
      mode="list"
      loadEntries={async (schoolId) => {
        const docentes: Docente[] = await getDocentesBySchool(schoolId);
        return docentes.map((d) => ({
          nombre: d.nombre,
          cargo: d.materia || 'docente',
          label: d.materia || 'Docente',
          presente: true,
          motivo: '',
        }));
      }}
      checkDuplicate={async (escuelaId, fecha) => {
        if (!user) return false;
        const existing = await getDocenteAttendanceByUserAndDate(escuelaId, fecha, user.uid);
        return existing.length > 0;
      }}
      onSubmit={async ({ escuelaId, fecha, registros }) => {
        if (!user || !profile) return;
        await addDocenteAttendance({
          escuelaId,
          fecha,
          cargadoPor: user.uid,
          cargadoPorNombre: profile.nombre,
          registros: registros.map((r) => ({
            nombre: r.nombre,
            materia: r.cargo === 'docente' ? undefined : r.cargo,
            presente: r.presente,
            motivo: r.motivo,
          })),
        });
      }}
      />
    </>
  );
};

export default AsistenciaDocentes;
