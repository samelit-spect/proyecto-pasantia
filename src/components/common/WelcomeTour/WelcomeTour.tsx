import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import {
  ClipboardCheck,
  Users,
  Camera,
  Newspaper,
  History,
  Eye,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './WelcomeTour.css';

interface TourStep {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const WELCOME_KEY_PREFIX = 'sipnam-welcome-seen-v1';

const markSeen = (storageKey: string) => {
  try {
    localStorage.setItem(storageKey, Date.now().toString());
  } catch {
    // noop
  }
};

const WelcomeTour = () => {
  const { profile, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  const storageKey = profile ? `${WELCOME_KEY_PREFIX}-${profile.uid}` : null;

  const steps = useMemo<TourStep[]>(() => {
    if (!profile) return [];
    const list: TourStep[] = [
      {
        icon: <ClipboardCheck size={22} strokeWidth={1.5} />,
        title: 'Asistencia',
        text: 'Desde Inicio cargá la asistencia del personal de gestión y del cuerpo docente.',
      },
    ];

    if (hasRole('director', 'vice')) {
      list.push(
        {
          icon: <Newspaper size={22} strokeWidth={1.5} />,
          title: 'Novedades e incidentes',
          text: 'Registrá las novedades institucionales del día e informá problemas edilicios al supervisor.',
        },
        {
          icon: <History size={22} strokeWidth={1.5} />,
          title: 'Seguimiento',
          text: 'En Historial podés ver el avance de tus incidentes: quién cambió cada estado y cuándo.',
        }
      );
    } else if (hasRole('preceptor')) {
      list.push({
        icon: <Camera size={22} strokeWidth={1.5} />,
        title: 'Foto diaria',
        text: 'Subí todos los días la foto de la planilla firmada como respaldo de la asistencia.',
      });
    }

    if (hasRole('supervisor')) {
      list.length = 0;
      list.push(
        {
          icon: <Eye size={22} strokeWidth={1.5} />,
          title: 'Panel de Supervisión',
          text: 'Todas las escuelas de la jurisdicción con sus indicadores del día en tiempo real.',
        },
        {
          icon: <Users size={22} strokeWidth={1.5} />,
          title: 'Verificación y seguimiento',
          text: 'Verificá asistencias y seguí los incidentes de cada escuela desde su detalle.',
        },
        {
          icon: <Settings size={22} strokeWidth={1.5} />,
          title: 'Administración',
          text: 'Creá usuarios, gestioná escuelas y docentes, y exportá respaldos de datos.',
        }
      );
    }

    list.push({
      icon: <HelpCircle size={22} strokeWidth={1.5} />,
      title: '¿Dudas?',
      text: 'Encontrá guías, preguntas frecuentes y cómo instalar la app en la sección Ayuda.',
    });

    return list;
  }, [profile, hasRole]);

  useEffect(() => {
    if (!profile || !storageKey) return;
    try {
      if (!localStorage.getItem(storageKey)) {
        const timer = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // sin localStorage no mostramos para no molestar en cada visita
    }
  }, [profile, storageKey]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const finish = () => {
    setOpen(false);
    if (storageKey) markSeen(storageKey);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!profile || !storageKey) return null;

  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;

  return (
    <AnimatePresence>
      {open && steps.length > 0 && (
        <m.div
          className="welcome-tour__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Bienvenida, ${profile.nombre}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          <m.div
            className="welcome-tour"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'translateY(8px) scale(0.98)' }
            }
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'none' }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'translateY(6px) scale(0.98)' }
            }
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <div className="welcome-tour__icon">{current.icon}</div>
            <span className="welcome-tour__counter">
              Paso {step + 1} de {steps.length}
            </span>
            <h3 className="welcome-tour__title">
              {step === 0 ? `¡Hola, ${profile.nombre.split(' ')[0]}!` : current.title}
            </h3>
            <p className="welcome-tour__text">{current.text}</p>

            <div className="welcome-tour__dots" aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`welcome-tour__dot ${i === step ? 'welcome-tour__dot--active' : ''}`}
                />
              ))}
            </div>

            <div className="welcome-tour__actions">
              <Link viewTransition to="/ayuda" className="welcome-tour__skip" onClick={finish}>
                Saltar
              </Link>
              <button
                className="welcome-tour__next"
                onClick={() => (isLast ? finish() : setStep(step + 1))}
              >
                {isLast ? 'Empezar' : 'Siguiente'}
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeTour;
