import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ClipboardCheck, Users, Newspaper, AlertTriangle, Eye } from 'lucide-react';
import './Home.css';

interface CardItem {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

const Home = () => {
  const { profile, hasRole } = useAuth();

  const attendanceCards: CardItem[] = [];
  const managementCards: CardItem[] = [];
  const supervisorCards: CardItem[] = [];

  if (hasRole('director', 'vice', 'preceptor')) {
    attendanceCards.push({
      to: '/asistencia',
      icon: <ClipboardCheck size={28} strokeWidth={1.5} />,
      title: 'Asistencia de Gestión',
      description: 'Registrar la asistencia diaria del personal de gestión.',
    });
    attendanceCards.push({
      to: '',
      icon: <Users size={28} strokeWidth={1.5} />,
      title: 'Asistencia de Docentes',
      description: 'Registrar la asistencia diaria del cuerpo docente.',
      disabled: true,
    });
  }

  if (hasRole('director', 'vice')) {
    managementCards.push({
      to: '/novedades',
      icon: <Newspaper size={28} strokeWidth={1.5} />,
      title: 'Novedades',
      description: 'Registrar novedades institucionales del día.',
    });
    managementCards.push({
      to: '/incidentes',
      icon: <AlertTriangle size={28} strokeWidth={1.5} />,
      title: 'Incidentes Edilicios',
      description: 'Registrar incidentes para seguimiento del Supervisor.',
    });
  }

  if (hasRole('supervisor')) {
    supervisorCards.push({
      to: '/supervisor',
      icon: <Eye size={28} strokeWidth={1.5} />,
      title: 'Panel de Supervisión',
      description: 'Visualizar información de todas las escuelas asignadas.',
    });
  }

  const renderCard = (card: CardItem) => {
    if (card.disabled) {
      return (
        <div key={card.title} className="home__card home__card--disabled">
          <div className="home__card-icon">{card.icon}</div>
          <div className="home__card-content">
            <h3 className="home__card-title">{card.title}</h3>
            <p className="home__card-desc">{card.description}</p>
          </div>
          <span className="home__card-badge">Próximamente</span>
        </div>
      );
    }

    return (
      <Link key={card.to} to={card.to} className="home__card">
        <div className="home__card-icon">{card.icon}</div>
        <div className="home__card-content">
          <h3 className="home__card-title">{card.title}</h3>
          <p className="home__card-desc">{card.description}</p>
        </div>
        <span className="home__card-arrow">Ir →</span>
      </Link>
    );
  };

  return (
    <section className="home">
      <div className="home__header">
        <div className="home__header-text">
          <h2 className="home__greeting">Hola, {profile?.nombre}</h2>
          <p className="home__subtitle">¿Qué deseas hacer hoy?</p>
        </div>
        <span className="home__role">{profile?.rol}</span>
      </div>

      {attendanceCards.length > 0 && (
        <div className="home__section">
          <h3 className="home__section-title">Asistencia</h3>
          <div className="home__cards">{attendanceCards.map(renderCard)}</div>
        </div>
      )}

      {managementCards.length > 0 && (
        <div className="home__section">
          <h3 className="home__section-title">Gestión</h3>
          <div className="home__cards">{managementCards.map(renderCard)}</div>
        </div>
      )}

      {supervisorCards.length > 0 && (
        <div className="home__section">
          <h3 className="home__section-title">Supervisión</h3>
          <div className="home__cards">{supervisorCards.map(renderCard)}</div>
        </div>
      )}
    </section>
  );
};

export default Home;
