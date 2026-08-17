import './Pagination.css';

type Props = {
  current: number;
  total: number;
  onChange: (page: number) => void;
};

const Pagination = ({ current, total, onChange }: Props) => {
  if (total <= 1) return null;

  return (
    <nav className="pagination" role="navigation" aria-label="Paginación">
      <button
        className="pagination__btn"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
      >
        ← Anterior
      </button>
      <span className="pagination__info">
        {current} / {total}
      </span>
      <button
        className="pagination__btn"
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
      >
        Siguiente →
      </button>
    </nav>
  );
};

export default Pagination;
