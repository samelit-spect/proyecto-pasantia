import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Newspaper, AlertTriangle } from 'lucide-react';
import {
  getAllAttendances,
  getAllNews,
  getAllIncidents,
  getSchools,
} from '@/services/api/firestore';
import './SupervisorDashboard.css';

interface Stats {
  totalAsistencias: number;
  totalNovedades: number;
  totalIncidentes: number;
  escuelasCount: number;
}

const SupervisorDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalAsistencias: 0,
    totalNovedades: 0,
    totalIncidentes: 0,
    escuelasCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [attendances, news, incidents, schools] = await Promise.all([
          getAllAttendances(),
          getAllNews(),
          getAllIncidents(),
          getSchools(),
        ]);
        setStats({
          totalAsistencias: attendances.length,
          totalNovedades: news.length,
          totalIncidentes: incidents.length,
          escuelasCount: schools.length,
        });
      } catch {
        // Error silenciado
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <div className="supervisor__loading">Cargando datos...</div>;
  }

  return (
    <div className="supervisor-dashboard">
      <p className="supervisor-dashboard__subtitle">
        Vista general de todas las escuelas del sistema.
      </p>

      <div className="supervisor-dashboard__stats">
        <div className="supervisor-dashboard__stat">
          <span className="supervisor-dashboard__stat-value">{stats.escuelasCount}</span>
          <span className="supervisor-dashboard__stat-label">Escuelas</span>
        </div>
        <div className="supervisor-dashboard__stat">
          <span className="supervisor-dashboard__stat-value">{stats.totalAsistencias}</span>
          <span className="supervisor-dashboard__stat-label">Asistencias</span>
        </div>
        <div className="supervisor-dashboard__stat">
          <span className="supervisor-dashboard__stat-value">{stats.totalNovedades}</span>
          <span className="supervisor-dashboard__stat-label">Novedades</span>
        </div>
        <div className="supervisor-dashboard__stat">
          <span className="supervisor-dashboard__stat-value">{stats.totalIncidentes}</span>
          <span className="supervisor-dashboard__stat-label">Incidentes</span>
        </div>
      </div>

      <div className="supervisor-dashboard__links">
        <Link to="/supervisor/asistencias" className="supervisor-dashboard__card">
          <div className="supervisor-dashboard__card-icon">
            <ClipboardCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="supervisor-dashboard__card-content">
            <h3 className="supervisor-dashboard__card-title">Asistencias</h3>
            <p className="supervisor-dashboard__card-desc">
              Consultar registros de asistencia por escuela y fecha.
            </p>
          </div>
        </Link>

        <Link to="/supervisor/novedades" className="supervisor-dashboard__card">
          <div className="supervisor-dashboard__card-icon">
            <Newspaper size={24} strokeWidth={1.5} />
          </div>
          <div className="supervisor-dashboard__card-content">
            <h3 className="supervisor-dashboard__card-title">Novedades</h3>
            <p className="supervisor-dashboard__card-desc">
              Consultar novedades institucionales por escuela.
            </p>
          </div>
        </Link>

        <Link to="/supervisor/incidentes" className="supervisor-dashboard__card">
          <div className="supervisor-dashboard__card-icon">
            <AlertTriangle size={24} strokeWidth={1.5} />
          </div>
          <div className="supervisor-dashboard__card-content">
            <h3 className="supervisor-dashboard__card-title">Incidentes</h3>
            <p className="supervisor-dashboard__card-desc">
              Gestionar y dar seguimiento a incidentes edilicios.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
