import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School, Settings } from 'lucide-react';
import { getSchools } from '@/services/api/firestore';
import type { School as SchoolType } from '@/types';
import './SupervisorSchools.css';

const SupervisorSchools = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch {
        setError('No se pudieron cargar las escuelas. Intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  return (
    <>
      <div className="supervisor__header">
        <h2 className="supervisor__title">Panel de Supervisión</h2>
      </div>
      <p className="supervisor__subtitle">Seleccioná una escuela para ver su información.</p>

      <Link to="/supervisor/usuarios" className="supervisor-schools__users-link">
        <Settings size={18} strokeWidth={1.5} />
        Configuración de usuarios
      </Link>

      {isLoading && <div className="supervisor__loading">Cargando escuelas...</div>}

      {error && <div className="supervisor__loading supervisor__loading--error">{error}</div>}

      {!isLoading && !error && schools.length === 0 && (
        <div className="supervisor__empty">No hay escuelas registradas.</div>
      )}

      {!isLoading && !error && schools.length > 0 && (
        <div className="supervisor-schools__grid">
          {schools.map((school) => (
            <Link
              key={school.id}
              to={`/supervisor/escuela/${school.id}`}
              className="supervisor-schools__card"
            >
              <div className="supervisor-schools__card-icon">
                <School size={24} strokeWidth={1.5} />
              </div>
              <div className="supervisor-schools__card-content">
                <h3 className="supervisor-schools__card-name">{school.nombre}</h3>
                <span className="supervisor-schools__card-turno">{school.turno}</span>
              </div>
              <span className="supervisor-schools__card-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default SupervisorSchools;
