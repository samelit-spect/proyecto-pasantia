import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getSchoolById,
  getAllAttendancesBySchool,
  getAllNewsBySchool,
  getIncidentsBySchool,
} from '@/services/api/firestore';
import type { School, Attendance, News, Incident } from '@/types';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import '../SupervisorAttendances/SupervisorSubPage.css';
import './SupervisorSchoolDetail.css';

const SupervisorSchoolDetail = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  const [school, setSchool] = useState<School | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>('asistencias');

  useEffect(() => {
    if (!schoolId) return;

    const loadSchoolData = async () => {
      try {
        const [schoolData, attendancesData, newsData, incidentsData] = await Promise.all([
          getSchoolById(schoolId),
          getAllAttendancesBySchool(schoolId),
          getAllNewsBySchool(schoolId),
          getIncidentsBySchool(schoolId),
        ]);

        setSchool(schoolData);
        setAttendances(attendancesData);
        setNews(newsData);
        setIncidents(incidentsData);
      } catch {
        setError('No se pudieron cargar los datos de la escuela.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchoolData();
  }, [schoolId]);

  if (isLoading) {
    return <div className="supervisor__loading">Cargando datos de la escuela...</div>;
  }

  if (error) {
    return <div className="supervisor__loading supervisor__loading--error">{error}</div>;
  }

  if (!school) {
    return <div className="supervisor__empty">Escuela no encontrada.</div>;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/supervisor')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">{school.nombre}</h2>
      </div>
      <p className="supervisor__subtitle">
        Turno: {school.turno} · Registros totales:{' '}
        {attendances.length + news.length + incidents.length}
      </p>

      <div className="supervisor-detail__sections">
        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('asistencias')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Asistencias</span>
              <span className="supervisor__section-count">{attendances.length} registros</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'asistencias' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'asistencias' && (
            <div className="supervisor-detail__section-body">
              {attendances.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de asistencia.</div>
              ) : (
                attendances.map((att) => (
                  <div key={att.id} className="supervisor-sub__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {att.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-sub__record-author">
                        Cargado por: {att.cargadoPorNombre}
                      </span>
                    </div>
                    <div className="supervisor-sub__record-list">
                      {att.registros.map((r, i) => (
                        <span
                          key={`${r.nombre}-${i}`}
                          className={`supervisor-sub__member ${r.presente ? 'supervisor-sub__member--present' : 'supervisor-sub__member--absent'}`}
                        >
                          {r.nombre} ({r.presente ? 'P' : 'A'})
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('novedades')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Novedades</span>
              <span className="supervisor__section-count">{news.length} registros</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'novedades' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'novedades' && (
            <div className="supervisor-detail__section-body">
              {news.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de novedades.</div>
              ) : (
                news.map((n) => (
                  <div key={n.id} className="supervisor-sub__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {n.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-sub__record-author">
                        Cargado por: {n.cargadoPorNombre}
                      </span>
                    </div>
                    <p className="supervisor-detail__desc">{n.descripcion}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="supervisor-detail__section">
          <button
            className="supervisor-detail__section-header"
            onClick={() => toggleSection('incidentes')}
          >
            <div className="supervisor-detail__section-info">
              <span className="supervisor__section-title">Incidentes</span>
              <span className="supervisor__section-count">{incidents.length} registros</span>
            </div>
            <span
              className={`supervisor-detail__arrow ${expandedSection === 'incidentes' ? 'supervisor-detail__arrow--open' : ''}`}
            >
              ▾
            </span>
          </button>
          {expandedSection === 'incidentes' && (
            <div className="supervisor-detail__section-body">
              {incidents.length === 0 ? (
                <div className="supervisor-sub__empty">No hay registros de incidentes.</div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="supervisor-sub__record supervisor-detail__incident">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {inc.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <StatusBadge status={inc.estado} />
                    </div>
                    <p className="supervisor-detail__desc">{inc.descripcion}</p>
                    <span className="supervisor-sub__record-author">
                      Cargado por: {inc.cargadoPorNombre}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupervisorSchoolDetail;
