import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
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
  getTodayAttendancesBySchool,
  getTodayNewsBySchool,
  getTodayIncidentsBySchool,
} from '@/services/api/firestore';
import type { Attendance, News, Incident, School } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import RetentionBanner from '@/components/common/RetentionBanner/RetentionBanner';
import Timeline, { type TimelineEvent } from '@/components/common/Timeline/Timeline';
import DashboardCharts from '@/components/common/DashboardCharts/DashboardCharts';
import { useCountUp } from '@/hooks/useCountUp';
import HomeSkeleton from './HomeSkeleton';
import './Home.css';

interface CardItem {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AnimatedStat = ({ value, label }: { value: number; label: string }) => {
  const animated = useCountUp(value);
  return (
    <div className="home__stat">
      <span className="home__stat-value">{animated}</span>
      <span className="home__stat-label">{label}</span>
    </div>
  );
};

const Home = () => {
  const { profile, hasRole } = useAuth();

  const [activityRef] = useAutoAnimate();
  const [alertsRef] = useAutoAnimate();

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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('supervisor')) return;

    let unmounted = false;

    // Cada fuente marca su primer snapshot; cuando todas llegaron, se apaga el skeleton.
    const TOTAL_INIT_STEPS = 5;
    let pendingSteps = TOTAL_INIT_STEPS;
    const settledSteps = new Set<string>();
    const settle = (key: string) => {
      if (settledSteps.has(key)) return;
      settledSteps.add(key);
      pendingSteps -= 1;
      if (pendingSteps <= 0 && !unmounted) setIsLoading(false);
    };

    getSchools()
      .then((schools) => {
        if (!unmounted) setStats((prev) => ({ ...prev, escuelas: schools.length }));
      })
      .catch(() => {
        if (!unmounted) setStatsError('No se pudieron cargar los datos.');
      })
      .finally(() => settle('escuelas'));

    const unsubs = [
      subscribeTodayAttendances((data) => {
        if (unmounted) return;
        setStats((prev) => ({ ...prev, asistencias: data.length }));
        setRecentAttendances(data.slice(0, 5));
        settle('asistencias');
      }),
      subscribeTodayNews((data) => {
        if (unmounted) return;
        setStats((prev) => ({ ...prev, novedades: data.length }));
        setRecentNews(data.slice(0, 5));
        settle('novedades');
      }),
      subscribeTodayIncidents((data) => {
        if (unmounted) return;
        setStats((prev) => ({ ...prev, incidentes: data.length }));
        setRecentIncidents(data.slice(0, 5));
        settle('incidentes');
      }),
      subscribeRecentIncidents(20, (recent) => {
        if (unmounted) return;
        const urgenciaOrder = { alta: 0, media: 1, baja: 2 };
        const open = recent
          .filter((i) => i.estado !== 'resuelto')
          .sort(
            (a, b) =>
              (urgenciaOrder[a.urgencia ?? 'baja'] ?? 3) -
              (urgenciaOrder[b.urgencia ?? 'baja'] ?? 3)
          )
          .slice(0, 5);
        setOpenIncidents(open);
        settle('abiertos');
      }),
    ];

    return () => {
      unmounted = true;
      unsubs.forEach((unsub) => unsub());
    };
  }, [hasRole]);

  useEffect(() => {
    if (hasRole('supervisor') || !profile?.escuelaId) return;

    let unmounted = false;

    const loadSchool = async () => {
      try {
        const school = await getSchoolById(profile.escuelaId);
        if (!unmounted) setMySchool(school);
      } catch {
        if (!unmounted) setStatsError('No se pudieron cargar los datos.');
      }
    };

    const loadActivity = async () => {
      try {
        const [attendances, news, incidents] = await Promise.all([
          getTodayAttendancesBySchool(profile.escuelaId),
          getTodayNewsBySchool(profile.escuelaId),
          getTodayIncidentsBySchool(profile.escuelaId),
        ]);
        if (unmounted) return;
        setMyAttendances(attendances);
        setMyNews(news);
        setMyIncidents(incidents);
      } catch {
        if (!unmounted) setStatsError('No se pudieron cargar los datos.');
      }
    };

    Promise.all([loadSchool(), loadActivity()]).finally(() => {
      if (!unmounted) setIsLoading(false);
    });

    let interval: ReturnType<typeof setInterval> | null = null;

    const startInterval = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') loadActivity();
      }, 30_000);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadActivity();
        startInterval();
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    startInterval();

    return () => {
      unmounted = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (interval) clearInterval(interval);
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
    <Link viewTransition key={card.to} to={card.to} className="home__card">
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
          <Breadcrumb items={[{ label: 'Inicio' }]} />
          <h2 className="home__greeting">
            Hola, <span className="home__greeting-name">{profile?.nombre}</span>
          </h2>
          <p className="home__subtitle">
            {hasRole('supervisor') ? 'Resumen del sistema educativo.' : '¿Qué deseas hacer hoy?'}
          </p>
        </div>
        <span className="home__role">{profile?.rol}</span>
      </div>

      {statsError && (
        <div className="home__error" role="alert">
          <span>{statsError}</span>
          <button className="home__error-close" onClick={() => setStatsError(null)}>
            ×
          </button>
        </div>
      )}

      {isLoading && <HomeSkeleton isSupervisor={hasRole('supervisor')} />}

      {!isLoading && !hasRole('supervisor') && mySchool && (
        <div className="home__section animate-fade-in">
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

      {!isLoading && !hasRole('supervisor') && (
        <div className="home__section animate-fade-in">
          <h3 className="home__section-title">
            <Clock
              size={14}
              strokeWidth={2}
              style={{ marginRight: '0.375rem', verticalAlign: 'middle' }}
            />
            Actividad de hoy
          </h3>
          {myAttendances.length === 0 && myNews.length === 0 && myIncidents.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title="Sin actividad hoy"
              description="Cuando se carguen asistencias o novedades, aparecerán aquí."
              action={{ label: 'Registrar asistencia', to: '/asistencia' }}
            />
          ) : (
            <Timeline
              events={[
                ...myAttendances.map((att): TimelineEvent => ({
                  id: att.id,
                  type: 'asistencia',
                  text: `Asistencia cargada por ${att.cargadoPorNombre}`,
                  time: att.fecha
                    .toDate()
                    .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                })),
                ...myNews.map((n): TimelineEvent => ({
                  id: n.id,
                  type: 'novedades',
                  text: `Novedad cargada por ${n.cargadoPorNombre}`,
                  time: n.fecha
                    .toDate()
                    .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                })),
                ...myIncidents.map((inc): TimelineEvent => ({
                  id: inc.id,
                  type: 'incidentes',
                  text: `Incidente cargado por ${inc.cargadoPorNombre}`,
                  time: inc.fecha
                    .toDate()
                    .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                  extra: <StatusBadge status={inc.estado} />,
                })),
              ].sort((a, b) => {
                const timeA = a.time || '';
                const timeB = b.time || '';
                return timeB.localeCompare(timeA);
              })}
            />
          )}
        </div>
      )}

      {!isLoading && hasRole('supervisor') && (
        <div className="animate-fade-in">
          <RetentionBanner />
          <div className="home__section">
            <h3 className="home__section-title">Resumen del día</h3>
            <div className="home__stats">
              <AnimatedStat value={stats.escuelas} label="Escuelas" />
              <AnimatedStat value={stats.asistencias} label="Asistencias" />
              <AnimatedStat value={stats.novedades} label="Novedades" />
              <AnimatedStat value={stats.incidentes} label="Incidentes" />
            </div>
          </div>

          <div className="home__section">
            <h3 className="home__section-title">Dashboard</h3>
            <DashboardCharts
              attendances={recentAttendances}
              news={recentNews}
              incidents={recentIncidents}
            />
          </div>

          {openIncidents.length > 0 && (
            <div className="home__section">
              <h3 className="home__section-title">Alertas de incidentes</h3>
              <div className="home__alerts" ref={alertsRef}>
                {openIncidents.map((inc) => (
                  <Link viewTransition key={inc.id} to="/supervisor" className="home__alert">
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
              <Link viewTransition to="/supervisor" className="home__card">
                <div className="home__card-icon home__card-icon--blue">
                  <Eye size={28} strokeWidth={1.5} />
                </div>
                <div className="home__card-content">
                  <h3 className="home__card-title">Panel de Supervisión</h3>
                  <p className="home__card-desc">Ver todas las escuelas y su información.</p>
                </div>
                <span className="home__card-arrow">Ir →</span>
              </Link>
              <Link viewTransition to="/supervisor/usuarios" className="home__card">
                <div className="home__card-icon home__card-icon--purple">
                  <Settings size={28} strokeWidth={1.5} />
                </div>
                <div className="home__card-content">
                  <h3 className="home__card-title">Configuración de Usuarios</h3>
                  <p className="home__card-desc">Crear y administrar directores de escuelas.</p>
                </div>
                <span className="home__card-arrow">Ir →</span>
              </Link>
              <Link viewTransition to="/tema" className="home__card">
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
              <div className="home__activity" ref={activityRef}>
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
        </div>
      )}

      {attendanceCards.length > 0 && (
        <div className="home__section animate-fade-in">
          <h3 className="home__section-title">Asistencia</h3>
          <div className="home__cards">{attendanceCards.map(renderCard)}</div>
        </div>
      )}

      {managementCards.length > 0 && (
        <div className="home__section animate-fade-in">
          <h3 className="home__section-title">Gestión</h3>
          <div className="home__cards">{managementCards.map(renderCard)}</div>
        </div>
      )}
    </section>
  );
};

export default Home;
