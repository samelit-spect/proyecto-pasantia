import { useState, useEffect } from 'react';
import { getSchools } from '@/services/api/firestore';
import type { School } from '@/types';
import './SchoolSelect.css';

interface SchoolSelectProps {
  value: string;
  onChange: (schoolId: string) => void;
  disabled?: boolean;
}

const SchoolSelect = ({ value, onChange, disabled = false }: SchoolSelectProps) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch {
        // Error silenciado — se muestra select vacío
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

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
        <option value="">{isLoading ? 'Cargando escuelas...' : 'Seleccionar escuela'}</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.nombre} — {school.turno}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SchoolSelect;
