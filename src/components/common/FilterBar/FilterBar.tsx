import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './FilterBar.css';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  children: React.ReactNode;
}

const FilterBar = ({ activeFilters, onRemoveFilter, onClearAll, children }: FilterBarProps) => {
  const [expanded, setExpanded] = useState(activeFilters.length > 0);
  const hasActive = activeFilters.length > 0;

  return (
    <div className="filter-bar">
      <button className="filter-bar__toggle" onClick={() => setExpanded(!expanded)}>
        <span className="filter-bar__toggle-label">
          Filtros
          {hasActive && <span className="filter-bar__badge">{activeFilters.length}</span>}
        </span>
        <ChevronDown
          size={16}
          className={`filter-bar__chevron ${expanded ? 'filter-bar__chevron--open' : ''}`}
        />
      </button>

      <div className={`filter-bar__body ${expanded ? 'filter-bar__body--open' : ''}`}>
        <div className="filter-bar__content">{children}</div>
      </div>

      {hasActive && (
        <div className="filter-bar__pills">
          {activeFilters.map((filter) => (
            <span key={filter.key} className="filter-bar__pill">
              <span className="filter-bar__pill-label">{filter.label}:</span>
              <span className="filter-bar__pill-value">{filter.value}</span>
              <button
                className="filter-bar__pill-remove"
                onClick={() => onRemoveFilter(filter.key)}
                aria-label={`Quitar filtro ${filter.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button className="filter-bar__clear" onClick={onClearAll}>
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
