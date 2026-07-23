import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { profile, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!profile) return null;

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">
        SIPNAM
      </NavLink>

      <div className="navbar__links">
        <NavLink to="/" end>Inicio</NavLink>

        {(hasRole('director', 'vice', 'preceptor')) && (
          <NavLink to="/asistencia">Asistencia</NavLink>
        )}

        {hasRole('director', 'vice') && (
          <>
            <NavLink to="/novedades">Novedades</NavLink>
            <NavLink to="/incidentes">Incidentes</NavLink>
          </>
        )}

        {hasRole('supervisor') && (
          <NavLink to="/supervisor">Supervisor</NavLink>
        )}
      </div>

      <div className="navbar__user">
        <span className="navbar__name">{profile.nombre}</span>
        <span className="navbar__role">{profile.rol}</span>
        <button onClick={handleLogout} className="navbar__logout">
          Salir
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
