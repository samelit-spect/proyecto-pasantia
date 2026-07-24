import { NavLink, Outlet } from 'react-router-dom';
import './Supervisor.css';

const Supervisor = () => {
  return (
    <section className="supervisor">
      <h2 className="supervisor__title">Panel de Supervisión</h2>

      <div className="supervisor__tabs">
        <NavLink
          to="/supervisor"
          end
          className={({ isActive }) =>
            `supervisor__tab ${isActive ? 'supervisor__tab--active' : ''}`
          }
        >
          Inicio
        </NavLink>
        <NavLink
          to="/supervisor/asistencias"
          className={({ isActive }) =>
            `supervisor__tab ${isActive ? 'supervisor__tab--active' : ''}`
          }
        >
          Asistencias
        </NavLink>
        <NavLink
          to="/supervisor/novedades"
          className={({ isActive }) =>
            `supervisor__tab ${isActive ? 'supervisor__tab--active' : ''}`
          }
        >
          Novedades
        </NavLink>
        <NavLink
          to="/supervisor/incidentes"
          className={({ isActive }) =>
            `supervisor__tab ${isActive ? 'supervisor__tab--active' : ''}`
          }
        >
          Incidentes
        </NavLink>
      </div>

      <div className="supervisor__content">
        <Outlet />
      </div>
    </section>
  );
};

export default Supervisor;
