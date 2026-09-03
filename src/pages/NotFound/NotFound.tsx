import { useNavigate } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <section className="not-found">
      <SearchX size={56} strokeWidth={1.5} color="var(--text-secondary)" />
      <p className="not-found__code">404</p>
      <h2 className="not-found__title">Página no encontrada</h2>
      <p className="not-found__text">La ruta que buscas no existe.</p>
      <button type="button" className="not-found__btn" onClick={() => navigate('/')}>
        <Home size={16} /> Volver al inicio
      </button>
    </section>
  );
};

export default NotFound;
