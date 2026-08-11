import { useState, useEffect } from 'react';
import { getPhotoUrl } from '@/services/api/storage';
import { ImageOff } from 'lucide-react';
import './FotoThumb.css';

interface FotoThumbProps {
  storagePath: string;
  alt?: string;
}

const FotoThumb = ({ storagePath, alt = 'Foto' }: FotoThumbProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPhotoUrl(storagePath)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (error) {
    return (
      <div className="foto-thumb foto-thumb--error">
        <ImageOff size={20} strokeWidth={1.5} />
        <span>No disponible</span>
      </div>
    );
  }

  if (!url) {
    return <div className="foto-thumb foto-thumb--loading">Cargando...</div>;
  }

  return <img className="foto-thumb" src={url} alt={alt} loading="lazy" />;
};

export default FotoThumb;
