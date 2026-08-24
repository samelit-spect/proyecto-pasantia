import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, School, Users, User, ArrowRight } from 'lucide-react';
import { getSchools, getAllUsers, getAllDocentes } from '@/services/api/firestore';
import type { School as SchoolType, UserProfile, Docente } from '@/types';
import './GlobalSearch.css';

interface SearchResult {
  type: 'escuela' | 'usuario' | 'docente';
  label: string;
  sublabel: string;
  to: string;
  score: number;
}

/**
 * Normaliza texto para búsqueda: minúsculas y sin acentos/diacríticos
 * ("Martín" == "martin", "Peña" == "pena"). Mantiene la longitud original.
 */
const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Puntúa un campo: 3 empieza con la consulta · 2 palabra que empieza · 1 contiene · 0 no coincide. */
const scoreField = (field: string | undefined, q: string): number => {
  if (!field) return 0;
  const nf = normalizeText(field);
  if (!nf.includes(q)) return 0;
  if (nf.startsWith(q)) return 3;
  if (nf.split(/\s+/).some((word) => word.startsWith(q))) return 2;
  return 1;
};

const GlobalSearch = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allData, setAllData] = useState<{
    schools: SchoolType[];
    users: UserProfile[];
    docentes: Docente[];
  } | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getSchools(), getAllUsers(), getAllDocentes()])
        .then(([schools, users, docentes]) => {
          setAllData({ schools, users, docentes });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setQuery('');
      setResults([]);
      setAllData(null);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const q = normalizeText(query.trim());
    if (!allData || !q) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const matched: SearchResult[] = [];

    allData.schools.forEach((s) => {
      const score = Math.max(
        scoreField(s.nombre, q),
        scoreField(s.direccion, q),
        scoreField(s.turno, q)
      );
      if (score > 0) {
        matched.push({
          type: 'escuela',
          label: s.nombre,
          sublabel: `${s.turno}${s.direccion ? ' · ' + s.direccion : ''}`,
          to: `/supervisor/escuela/${s.id}`,
          score,
        });
      }
    });

    allData.users.forEach((u) => {
      const score = Math.max(scoreField(u.nombre, q), scoreField(u.email, q), scoreField(u.rol, q));
      if (score > 0) {
        matched.push({
          type: 'usuario',
          label: u.nombre,
          sublabel: `${u.email} · ${u.rol}`,
          to: '/supervisor/usuarios',
          score,
        });
      }
    });

    allData.docentes.forEach((d) => {
      const score = Math.max(scoreField(d.nombre, q), scoreField(d.materia, q));
      if (score > 0) {
        matched.push({
          type: 'docente',
          label: d.nombre,
          sublabel: `${d.materia ? d.materia + ' · ' : ''}${d.activo ? 'Activo' : 'Inactivo'}`,
          to: `/supervisor/escuela/${d.escuelaId}`,
          score,
        });
      }
    });

    matched.sort((a, b) => b.score - a.score);
    setResults(matched.slice(0, 10));
    setSelectedIndex(0);
  }, [query, allData]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.to, { viewTransition: true });
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  const typeIcons = {
    escuela: <School size={16} />,
    usuario: <Users size={16} />,
    docente: <User size={16} />,
  };

  const typeLabels = {
    escuela: 'Escuela',
    usuario: 'Usuario',
    docente: 'Docente',
  };

  const renderLabel = (result: SearchResult) => {
    const q = query.trim();
    if (!q) return result.label;
    const idx = normalizeText(result.label).indexOf(normalizeText(q));
    if (idx < 0) return result.label;
    return (
      <>
        {result.label.slice(0, idx)}
        <mark className="global-search__mark">{result.label.slice(idx, idx + q.length)}</mark>
        {result.label.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="global-search__overlay" onClick={onClose}>
      <div className="global-search" onClick={(e) => e.stopPropagation()}>
        <div className="global-search__input-wrapper">
          <Search size={18} className="global-search__icon" />
          <input
            ref={inputRef}
            className="global-search__input"
            type="text"
            placeholder="Buscar escuelas, usuarios, docentes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Buscar"
          />
          <kbd className="global-search__kbd">ESC</kbd>
          <button className="global-search__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="global-search__body">
          {loading && <p className="global-search__hint">Cargando datos...</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="global-search__hint">Sin resultados para "{query}"</p>
          )}
          {!loading &&
            results.map((result, i) => (
              <button
                key={`${result.type}-${result.label}-${i}`}
                className={`global-search__result ${i === selectedIndex ? 'global-search__result--selected' : ''}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span
                  className={`global-search__result-icon global-search__result-icon--${result.type}`}
                >
                  {typeIcons[result.type]}
                </span>
                <div className="global-search__result-text">
                  <span className="global-search__result-label">{renderLabel(result)}</span>
                  <span className="global-search__result-sublabel">
                    {typeLabels[result.type]} · {result.sublabel}
                  </span>
                </div>
                <ArrowRight size={14} className="global-search__result-arrow" />
              </button>
            ))}
          {!loading && !query.trim() && (
            <p className="global-search__hint">
              Buscá escuelas de Tinogasta, usuarios o docentes por nombre, dirección, materia, rol o
              email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
