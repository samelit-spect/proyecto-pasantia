import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ClipboardCheck,
  Users,
  Newspaper,
  AlertTriangle,
  Eye,
  Settings,
  Camera,
} from 'lucide-react';
import {
  getTodayAttendances,
  getTodayNews,
  getTodayIncidents,
  getRecentIncidents,
  getSchools,
} from '@/services/api/firestore';
import type { Attendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import './Home.css';

interface CardItem {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Home = () => {
  const { profile, hasRole } = useAuth();
  const initialized = useRef(false);

  const [stats, setStats] = useState({ escuelas: 0, asistencias: 0, novedades: 0, incidentes: 0 });
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRole('supervisor') || initialized.current) return;
    initialized.current = true;

    const loadData = async () => {
      try {
        const [schools, attendances, news, incidents, recent] = await Promise.all([
          getSchools(),
          getTodayAttendances(),
          getTodayNews(),
          getTodayIncidents(),
          getRecentIncidents(20),
        ]);

        setStats({
          escuelas: schools.length,
          asistencias: attendances.length,
          novedades: news.length,
          incidentes: incidents.length,
        });
        setRecentAttendances(attendances.slice(0, 5));
        setRecentNews(news.slice(0, 5));
        setRecentIncidents(incidents.slice(0, 5));

        const open = recent
          .filter((i) => i.estado !== 'resuelto')
          .sort((a, b) => {
            const urgenciaOrder = { alta: 0, media: 1, baja: 2 };
            return (
              (urgenciaOrder[a.urgencia ?? 'baja'] ?? 3) -
              (urgenciaOrder[b.urgencia ?? 'baja'] ?? 3)
            );
          })
          .slice(0, 5);
        setOpenIncidents(open);
      } catch {
        setStatsError('No se pudieron cargar los datos. Revisá tu conexión e intentá de nuevo.');
      }
    };

    loadData();
  }, [hasRole]);

  const attendanceCards: CardItem[] = [];
  const managementCards: CardItem[] = [];

  if (hasRole('director', 'vice', 'preceptor')) {
    attendanceCards.push({
      to: '/asistencia',
      icon: <ClipboardCheck size={28} strokeWidth={1.5} />,
      title: 'Asistencia de Gestión',
      description: 'Registrar la asistencia diaria del personal de gestión.',
    });
    attendanceCards.push({
      to: '/asistencia-docentes',
      icon: <Users size={28} strokeWidth={1.5} />,
      title: 'Asistencia de Docentes',
      description: 'Registrar la asistencia diaria del cuerpo docente.',
    });
    attendanceCards.push({
      to: '/historial',
      icon: <Eye size={28} strokeWidth={1.5} />,
      title: 'Historial',
      description: 'Consultar asistencias, novedades e incidentes cargados.',
    });
  }

  if (hasRole('preceptor')) {
    attendanceCards.push({
      to: '/fotos',
      icon: <Camera size={28} strokeWidth={1.5} />,
      title: 'Foto Diaria',
      description: 'Subir la foto de la planilla firmada de asistencia.',
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

  const renderCard = (card: CardItem) => (
    <Link key={card.to} to={card.to} className="home__card">
      <div className="home__card-icon">{card.icon}</div>
      <div className="home__card-content">
        <h3 className="home__card-title">{card.title}</h3>
        <p className="home__card-desc">{card.description}</p>
      </div>
      <span className="home__card-arrow">Ir →</span>
    </Link>
  );

  return (
    <section className="home">
      <div className="home__header">
        <div className="home__header-text">
          <h2 className="home__greeting">Hola, {profile?.nombre}</h2>
          <p className="home__subtitle">
            {hasRole('supervisor') ? 'Resumen del sistema educativo.' : '¿Qué deseas hacer hoy?'}
          </p>
        </div>
        <span className="home__role">{profile?.rol}</span>
      </div>

      {hasRole('supervisor') && (
        <>
          {statsError && (
            <div className="home__error" role="alert">
              {statsError}
            </div>
          )}

          <div className="home__section">
            <h3 className="home__section-title">Resumen del día</h3>
            <div className="home__stats">
              <div className="home__stat">
                <span className="home__stat-value">{stats.escuelas}</span>
                <span className="home__stat-label">Escuelas</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-value">{stats.asistencias}</span>
                <span className="home__stat-label">Asistencias</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-value">{stats.novedades}</span>
                <span className="home__stat-label">Novedades</span>
              </div>
              <div className="home__stat">
                <span className="home__stat-value">{stats.incidentes}</span>
                <span className="home__stat-label">Incidentes</span>
              </div>
            </div>
          </div>

          {openIncidents.length > 0 && (
            <div className="home__section">
              <h3 className="home__section-title">Alertas de incidentes</h3>
              <div className="home__alerts">
                {openIncidents.map((inc) => (
                  <Link key={inc.id} to="/supervisor" className="home__alert">
                    <div className="home__alert-content">
                      <span className="home__alert-title">
                        {inc.cargadoPorNombre} · {inc.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="home__alert-desc">{inc.descripcion}</span>
                    </div>
                    <StatusBadge status={inc.estado} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="home__section">
            <h3 className="home__section-title">Acciones rápidas</h3>
            <div className="home__cards">
              <Link to="/supervisor" className="home__card">
                <div className="home__card-icon home__card-icon--blue">
                  <Eye size={28} strokeWidth={1.5} />
                </div>
                <div className="home__card-content">
                  <h3 className="home__card-title">Panel de Supervisión</h3>
                  <p className="home__card-desc">Ver todas las escuelas y su información.</p>
                </div>
                <span className="home__card-arrow">Ir →</span>
              </Link>
              <Link to="/supervisor/usuarios" className="home__card">
                <div className="home__card-icon home__card-icon--purple">
                  <Settings size={28} strokeWidth={1.5} />
                </div>
                <div className="home__card-content">
                  <h3 className="home__card-title">Configuración de Usuarios</h3>
                  <p className="home__card-desc">Crear y administrar directores de escuelas.</p>
                </div>
                <span className="home__card-arrow">Ir →</span>
              </Link>
            </div>
          </div>

          {(recentAttendances.length > 0 ||
            recentNews.length > 0 ||
            recentIncidents.length > 0) && (
            <div className="home__section">
              <h3 className="home__section-title">Actividad de hoy</h3>
              <div className="home__activity">
                {recentAttendances.map((att) => (
                  <div key={att.id} className="home__activity-item">
                    <div className="home__activity-dot home__activity-dot--asistencia" />
                    <div className="home__activity-content">
                      <span className="home__activity-text">
                        Asistencia cargada por <strong>{att.cargadoPorNombre}</strong>
                      </span>
                      <span className="home__activity-time">
                        {att.fecha
                          .toDate()
                          .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {recentNews.map((n) => (
                  <div key={n.id} className="home__activity-item">
                    <div className="home__activity-dot home__activity-dot--novedades" />
                    <div className="home__activity-content">
                      <span className="home__activity-text">
                        Novedad cargada por <strong>{n.cargadoPorNombre}</strong>
                      </span>
                      <span className="home__activity-time">
                        {n.fecha
                          .toDate()
                          .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {recentIncidents.map((inc) => (
                  <div key={inc.id} className="home__activity-item">
                    <div className="home__activity-dot home__activity-dot--incidentes" />
                    <div className="home__activity-content">
                      <span className="home__activity-text">
                        Incidente cargado por <strong>{inc.cargadoPorNombre}</strong>
                      </span>
                      <div className="home__activity-meta">
                        <StatusBadge status={inc.estado} />
                        <span className="home__activity-time">
                          {inc.fecha
                            .toDate()
                            .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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
    </section>
  );
};

export default Home;
