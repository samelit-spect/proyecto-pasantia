import { X } from 'lucide-react';

interface LightboxProps {
  src: string;
  onClose: () => void;
}

const Lightbox = ({ src, onClose }: LightboxProps) => (
  <div
    className="supervisor-detail__lightbox"
    role="dialog"
    aria-modal="true"
    aria-label="Foto ampliada"
    onClick={onClose}
  >
    <button className="supervisor-detail__lightbox-close" onClick={onClose} title="Cerrar">
      <X size={22} strokeWidth={1.5} />
    </button>
    <img className="supervisor-detail__lightbox-img" src={src} alt="Foto ampliada" />
  </div>
);

export default Lightbox;
