import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import './SupervisorUsers.css';

const SupervisorUsers = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/supervisor')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">Configuración de Usuarios</h2>
      </div>
      <p className="supervisor__subtitle">Crear, editar y eliminar directores de escuelas.</p>

      <div className="supervisor-users__placeholder">
        <UserPlus size={48} strokeWidth={1} />
        <h3 className="supervisor-users__placeholder-title">Próximamente</h3>
        <p className="supervisor-users__placeholder-desc">
          Esta sección permitirá crear cuentas de director para cada escuela, asignar credenciales y
          gestionar los usuarios del sistema.
        </p>
      </div>
    </>
  );
};

export default SupervisorUsers;
