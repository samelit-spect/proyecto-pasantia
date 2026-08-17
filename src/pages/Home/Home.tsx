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
  Palette,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  getSchools,
  getSchoolById,
  subscribeTodayAttendances,
  subscribeTodayNews,
  subscribeTodayIncidents,
  subscribeRecentIncidents,
  subscribeTodayAttendancesBySchool,
  subscribeTodayNewsBySchool,
  subscribeTodayIncidentsBySchool,
} from '@/services/api/firestore';
import type { Attendance, News, Incident, School } from '@/types';
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

  const [mySchool, setMySchool] = useState<School | null>(null);
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
  const [myNews, setMyNews] = useState<News[]>([]);
  const [myIncidents, setMyIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    if (!hasRole('supervisor') || initialized.current) return;
    initialized.current = true;

    let unmounted = false;

    const loadSchoolsAndSubscribe = async () => {
      try {
        const schools = await getSchools();
        if (unmounted) return;
        setStats((prev) => ({ ...prev, escuelas: schools.length }));
      } catch {
        if (!unmounted) setStatsError('No se pudieron cargar los datos.');
      }
    };

    loadSchoolsAndSubscribe();

    const unsubAttendances = subscribeTodayAttendances((data) => {
      if (!unmounted) {
        setRecentAttendances(data.slice(0, 5));
        setStats((prev) => ({ ...prev, asistencias: data.length }));
      }
    });

    const unsubNews = subscribeTodayNews((data) => {
      if (!unmounted) {
        setRecentNews(data.slice(0, 5));
        setStats((prev) => ({ ...prev, novedades: data.length }));
      }
    });

    const unsubIncidents = subscribeTodayIncidents((data) => {
      if (!unmounted) {
        setRecentIncidents(data.slice(0, 5));
        setStats((prev) => ({ ...prev, incidentes: data.length }));
      }
    });

    const unsubRecent = subscribeRecentIncidents(20, (data) => {
      if (!unmounted) {
        const open = data
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
      }
    });

    return () => {
      unmounted = true;
      unsubAttendances();
      unsubNews();
      unsubIncidents();
      unsubRecent();
    };
  }, [hasRole]);

  useEffect(() => {
    if (hasRole('supervisor') || !profile?.escuelaId || initialized.current) return;
    initialized.current = true;

    let unmounted = false;

    const loadSchool = async () => {
      try {
        const school = await getSchoolById(profile.escuelaId);
        if (!unmounted) setMySchool(school);
      } catch {
        if (!unmounted) setStatsError('No se pudieron cargar los datos.');
      }
    };

    loadSchool();

    const unsubAttendances = subscribeTodayAttendancesBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setMyAttendances(data);
    });

    const unsubNews = subscribeTodayNewsBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setMyNews(data);
    });

    const unsubIncidents = subscribeTodayIncidentsBySchool(profile.escuelaId, (data) => {
      if (!unmounted) setMyIncidents(data);
    });

    return () => {
      unmounted = true;
      unsubAttendances();
      unsubNews();
      unsubIncidents();
    };
  }, [hasRole, profile?.escuelaId]);

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

      {statsError && (
        <div className="home__error" role="alert">
          {statsError}
        </div>
      )}

      {!hasRole('supervisor') && mySchool && (
        <div className="home__section">
          <h3 className="home__section-title">Mi escuela</h3>
          <div className="home__school-card">
            <div className="home__school-card-header">
              <span className="home__school-card-name">{mySchool.nombre}</span>
              <span className="home__school-card-turno">{mySchool.turno}</span>
            </div>
            {mySchool.direccion && (
              <div className="home__school-card-row">
                <MapPin size={14} strokeWidth={2} />
                <span>{mySchool.direccion}</span>
              </div>
            )}
            <div className="home__school-card-stats">
              <div className="home__school-stat home__school-stat--asistencia">
                <span className="home__school-stat-value">{myAttendances.length}</span>
                <span className="home__school-stat-label">Asistencias</span>
              </div>
              <div className="home__school-stat home__school-stat--novedades">
                <span className="home__school-stat-value">{myNews.length}</span>
                <span className="home__school-stat-label">Novedades</span>
              </div>
              <div className="home__school-stat home__school-stat--incidentes">
                <span className="home__school-stat-value">{myIncidents.length}</span>
                <span className="home__school-stat-label">Incidentes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasRole('supervisor') && (
        <div className="home__section">
          <h3 className="home__section-title">
            <Clock size={14} strokeWidth={2} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Actividad de hoy
          </h3>
          {myAttendances.length === 0 && myNews.length === 0 && myIncidents.length === 0 ? (
            <p className="home__empty-activity">Sin actividad registrada hoy.</p>
          ) : (
            <div className="home__activity">
              {myAttendances.map((att) => (
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
              {myNews.map((n) => (
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
              {myIncidents.map((inc) => (
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
          )}
        </div>
      )}

      {hasRole('supervisor') && (
        <>
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
              <Link to="/tema" className="home__card">
                <div className="home__card-icon home__card-icon--teal">
                  <Palette size={28} strokeWidth={1.5} />
                </div>
                <div className="home__card-content">
                  <h3 className="home__card-title">Apariencia</h3>
                  <p className="home__card-desc">Configurar colores, tema y estilo de la app.</p>
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
