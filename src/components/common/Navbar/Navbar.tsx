import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, LogOut, Menu, X, Eye, User, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { profile, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  if (!profile) return null;

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">
            <Shield size={18} strokeWidth={2} />
          </span>
          <span className="navbar__brand-text">SIPNAM</span>
        </Link>

        <button className="navbar__hamburger" onClick={() => setIsMenuOpen(true)} title="Menú">
          <Menu size={20} strokeWidth={1.5} />
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
          <Link to="/" className="navbar__drawer-link" onClick={() => setIsMenuOpen(false)}>
            <Home size={18} strokeWidth={1.5} />
            Inicio
          </Link>

          {hasRole('supervisor') && (
            <Link
              to="/supervisor"
              className="navbar__drawer-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <Eye size={18} strokeWidth={1.5} />
              Panel Supervisor
            </Link>
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
    </>
  );
};

export default Navbar;
