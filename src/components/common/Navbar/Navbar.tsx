import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  LogOut,
  Menu,
  X,
  Eye,
  User,
  Shield,
  ClipboardCheck,
  Newspaper,
  AlertTriangle,
  Settings,
  Users,
  Camera,
  History,
  Search,
} from 'lucide-react';
import GlobalSearch from '@/components/common/GlobalSearch/GlobalSearch';
import NotificationBell from '@/components/common/NotificationBell/NotificationBell';
import BottomNav from '@/components/common/BottomNav/BottomNav';
import './Navbar.css';

const Navbar = () => {
  const { profile, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!profile) return null;

  return (
    <>
      <nav className="navbar">
        <Link viewTransition to="/" className="navbar__brand">
          <span className="navbar__brand-icon">
            <Shield size={18} strokeWidth={2} />
          </span>
          <span className="navbar__brand-text">SIPNAM</span>
        </Link>

        <div className="navbar__right">
          <NotificationBell />
          <button className="navbar__hamburger" onClick={() => setIsMenuOpen(true)} title="Menú">
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <nav className="navbar__desktop">
        <Link viewTransition to="/" className="navbar__desktop-link">
          <Home size={16} strokeWidth={1.5} />
          Inicio
        </Link>
        {hasRole('director', 'vice', 'preceptor') && (
          <>
            <Link viewTransition to="/asistencia" className="navbar__desktop-link">
              <ClipboardCheck size={16} strokeWidth={1.5} />
              Asistencia
            </Link>
            <Link viewTransition to="/asistencia-docentes" className="navbar__desktop-link">
              <Users size={16} strokeWidth={1.5} />
              Docentes
            </Link>
            <Link viewTransition to="/historial" className="navbar__desktop-link">
              <History size={16} strokeWidth={1.5} />
              Historial
            </Link>
          </>
        )}
        {hasRole('preceptor') && (
          <Link viewTransition to="/fotos" className="navbar__desktop-link">
            <Camera size={16} strokeWidth={1.5} />
            Fotos
          </Link>
        )}
        {hasRole('director', 'vice') && (
          <>
            <Link viewTransition to="/novedades" className="navbar__desktop-link">
              <Newspaper size={16} strokeWidth={1.5} />
              Novedades
            </Link>
            <Link viewTransition to="/incidentes" className="navbar__desktop-link">
              <AlertTriangle size={16} strokeWidth={1.5} />
              Incidentes
            </Link>
          </>
        )}
        {hasRole('supervisor') && (
          <>
            <Link viewTransition to="/supervisor" className="navbar__desktop-link">
              <Eye size={16} strokeWidth={1.5} />
              Supervisión
            </Link>
            <Link viewTransition to="/supervisor/usuarios" className="navbar__desktop-link">
              <Settings size={16} strokeWidth={1.5} />
              Usuarios
            </Link>
          </>
        )}
        <div className="navbar__desktop-spacer" />
        <NotificationBell />
        <button
          onClick={() => setIsSearchOpen(true)}
          className="navbar__desktop-search"
          title="Buscar (Ctrl+K)"
        >
          <Search size={14} strokeWidth={2} />
          <kbd>⌘K</kbd>
        </button>
        <button onClick={handleLogout} className="navbar__desktop-logout">
          <LogOut size={16} strokeWidth={1.5} />
          Salir
        </button>
      </nav>

      {isMenuOpen && <div className="navbar__overlay" />}

      <div ref={menuRef} className={`navbar__drawer ${isMenuOpen ? 'navbar__drawer--open' : ''}`}>
        <div className="navbar__drawer-header">
          <span className="navbar__drawer-title">Menú</span>
          <button
            className="navbar__drawer-close"
            onClick={() => setIsMenuOpen(false)}
            title="Cerrar menú"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="navbar__drawer-user">
          <div className="navbar__drawer-avatar">
            <User size={20} strokeWidth={1.5} />
          </div>
          <div className="navbar__drawer-user-info">
            <span className="navbar__drawer-name">{profile.nombre}</span>
            <span className="navbar__drawer-role">{profile.rol}</span>
          </div>
        </div>

        <div className="navbar__drawer-body">
          <Link
            viewTransition
            to="/"
            className="navbar__drawer-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home size={18} strokeWidth={1.5} />
            Inicio
          </Link>

          {hasRole('director', 'vice', 'preceptor') && (
            <>
              <Link
                viewTransition
                to="/asistencia"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <ClipboardCheck size={18} strokeWidth={1.5} />
                Asistencia de Gestión
              </Link>
              <Link
                viewTransition
                to="/asistencia-docentes"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} strokeWidth={1.5} />
                Asistencia de Docentes
              </Link>
              <Link
                viewTransition
                to="/historial"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <History size={18} strokeWidth={1.5} />
                Historial de Cargas
              </Link>
            </>
          )}

          {hasRole('preceptor') && (
            <Link
              viewTransition
              to="/fotos"
              className="navbar__drawer-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <Camera size={18} strokeWidth={1.5} />
              Foto Diaria
            </Link>
          )}

          {hasRole('director', 'vice') && (
            <>
              <Link
                viewTransition
                to="/novedades"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Newspaper size={18} strokeWidth={1.5} />
                Novedades
              </Link>
              <Link
                viewTransition
                to="/incidentes"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <AlertTriangle size={18} strokeWidth={1.5} />
                Incidentes
              </Link>
            </>
          )}

          {hasRole('supervisor') && (
            <>
              <Link
                viewTransition
                to="/supervisor"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Eye size={18} strokeWidth={1.5} />
                Panel Supervisor
              </Link>
              <Link
                viewTransition
                to="/supervisor/usuarios"
                className="navbar__drawer-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={18} strokeWidth={1.5} />
                Configuración de Usuarios
              </Link>
            </>
          )}
        </div>

        <div className="navbar__drawer-footer">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="navbar__drawer-logout"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </div>

      <GlobalSearch open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <BottomNav onOpenDrawer={() => setIsMenuOpen(true)} />
    </>
  );
};

export default Navbar;
