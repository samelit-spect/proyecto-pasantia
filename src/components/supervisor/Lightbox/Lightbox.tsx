import { m, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

interface LightboxProps {
  src: string;
  onClose: () => void;
}

const Lightbox = ({ src, onClose }: LightboxProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="supervisor-detail__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <button className="supervisor-detail__lightbox-close" onClick={onClose} title="Cerrar">
        <X size={22} strokeWidth={1.5} />
      </button>
      <m.img
        className="supervisor-detail__lightbox-img"
        src={src}
        alt="Foto ampliada"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      />
    </m.div>
  );
};

export default Lightbox;
