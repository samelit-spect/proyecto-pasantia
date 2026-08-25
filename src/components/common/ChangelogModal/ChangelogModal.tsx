import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import './ChangelogModal.css';

const CURRENT_VERSION = '1.19.0';

interface ChangelogEntry {
  version: string;
  title: string;
  items: string[];
}

const ENTRIES: ChangelogEntry[] = [
  {
    version: '1.19.0',
    title: 'Mejoras de experiencia',
    items: [
      'Cola de archivos offline mejorada con indicador visual',
      'Gestos de deslizar para navegar',
      'Animaciones de éxito al enviar formularios',
      'Mapa de calor de asistencia mensual',
      'Modal de novedades para conocer las actualizaciones',
    ],
  },
  {
    version: '1.14.0',
    title: 'Nuevas funciones',
    items: [
      'Auto-guardado de formularios',
      'Notificaciones en tiempo real para supervisores',
      'Atajos de teclado (Ctrl+K para buscar)',
      'Estilos de impresión mejorados',
      'Ilustraciones en estados vacíos',
    ],
  },
  {
    version: '1.9.0',
    title: 'Personalización',
    items: [
      'Modo oscuro con toggle en el menú',
      'Sparklines en el dashboard del supervisor',
      'Página de perfil de usuario',
      'Feedback háptico en formularios',
      'Pull-to-refresh en home e historial',
    ],
  },
];

const STORAGE_KEY = 'sipnam-changelog-seen';

export default function ChangelogModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== CURRENT_VERSION) {
        setShow(true);
      }
    } catch {
      // noop
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    } catch {
      // noop
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="changelog-overlay" onClick={dismiss}>
      <div className="changelog-modal" onClick={(e) => e.stopPropagation()}>
        <button className="changelog-modal__close" onClick={dismiss} aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="changelog-modal__header">
          <div className="changelog-modal__icon">
            <Sparkles size={24} />
          </div>
          <h2 className="changelog-modal__title">Novedades</h2>
        </div>
        <div className="changelog-modal__body">
          {ENTRIES.map((entry) => (
            <div key={entry.version} className="changelog-entry">
              <div className="changelog-entry__header">
                <span className="changelog-entry__version">v{entry.version}</span>
                <span className="changelog-entry__title">{entry.title}</span>
              </div>
              <ul className="changelog-entry__list">
                {entry.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button className="changelog-modal__cta" onClick={dismiss}>
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}
