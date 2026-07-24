import { useState, useEffect } from 'react';
import { getAllNews, getSchools } from '@/services/api/firestore';
import type { News, School } from '@/types';
import '../SupervisorAttendances/SupervisorSubPage.css';
import './SupervisorNews.css';

interface GroupedNews {
  [schoolId: string]: {
    school: School;
    records: News[];
  };
}

const SupervisorNews = () => {
  const [grouped, setGrouped] = useState<GroupedNews>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [news, schools] = await Promise.all([getAllNews(), getSchools()]);
        const schoolMap = new Map(schools.map((s) => [s.id, s]));
        const groups: GroupedNews = {};

        for (const n of news) {
          if (!groups[n.escuelaId]) {
            groups[n.escuelaId] = {
              school: schoolMap.get(n.escuelaId) || {
                id: n.escuelaId,
                nombre: 'Escuela desconocida',
                turno: '',
                activa: true,
              },
              records: [],
            };
          }
          groups[n.escuelaId].records.push(n);
        }

        setGrouped(groups);
      } catch {
        setError('No se pudieron cargar las novedades. Intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="supervisor-sub__loading">Cargando novedades...</div>;
  }

  if (error) {
    return <div className="supervisor-sub__loading supervisor-sub__loading--error">{error}</div>;
  }

  const schoolIds = Object.keys(grouped);

  if (schoolIds.length === 0) {
    return <div className="supervisor-sub__empty">No hay registros de novedades.</div>;
  }

  return (
    <div className="supervisor-sub">
      {schoolIds.map((schoolId) => {
        const { school, records } = grouped[schoolId];
        const isExpanded = expandedSchool === schoolId;

        return (
          <div key={schoolId} className="supervisor-sub__group">
            <button
              className="supervisor-sub__group-header"
              onClick={() => setExpandedSchool(isExpanded ? null : schoolId)}
            >
              <div className="supervisor-sub__group-info">
                <span className="supervisor-sub__group-name">{school.nombre}</span>
                <span className="supervisor-sub__group-count">{records.length} registros</span>
              </div>
              <span
                className={`supervisor-sub__arrow ${isExpanded ? 'supervisor-sub__arrow--open' : ''}`}
              >
                ▾
              </span>
            </button>

            {isExpanded && (
              <div className="supervisor-sub__group-body">
                {records.map((news) => (
                  <div key={news.id} className="supervisor-sub__record">
                    <div className="supervisor-sub__record-header">
                      <span className="supervisor-sub__record-date">
                        {news.fecha.toDate().toLocaleDateString('es-AR')}
                      </span>
                      <span className="supervisor-sub__record-author">
                        Cargado por: {news.cargadoPorNombre}
                      </span>
                    </div>
                    <p className="supervisor-news__desc">{news.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SupervisorNews;
