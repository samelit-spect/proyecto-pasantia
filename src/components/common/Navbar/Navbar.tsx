import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">
        Proyecto Pasantía
      </NavLink>

      <div className="navbar__links">
        <NavLink to="/">Inicio</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
