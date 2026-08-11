import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSchools } from '@/services/api/firestore';
import type { School } from '@/types';
import './SchoolSelect.css';

interface SchoolSelectProps {
  value: string;
  onChange: (schoolId: string) => void;
  disabled?: boolean;
}

const SchoolSelect = ({ value, onChange, disabled = false }: SchoolSelectProps) => {
  const { profile, hasRole } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSchools = async () => {
      setError(null);
      try {
        const data = await getSchools();
        if (cancelled) return;

        const scoped = hasRole('supervisor')
          ? data
          : data.filter((s) => s.id === profile?.escuelaId);
        setSchools(scoped);

        if (!hasRole('supervisor') && scoped.length > 0) {
          onChange(scoped[0].id);
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar las escuelas.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchSchools();
    return () => {
      cancelled = true;
    };
  }, [hasRole, profile?.escuelaId, onChange]);

  return (
    <div className="school-select">
      <label htmlFor="school-select" className="school-select__label">
        Escuela
      </label>
      <select
        id="school-select"
        className="school-select__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        required
      >
        <option value="">
          {isLoading
            ? 'Cargando escuelas...'
            : schools.length === 0
              ? 'No hay escuelas disponibles'
              : 'Seleccionar escuela'}
        </option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.nombre} — {school.turno}
          </option>
        ))}
      </select>
      {error && (
        <span className="school-select__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default SchoolSelect;
