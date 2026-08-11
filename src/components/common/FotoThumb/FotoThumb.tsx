import './FotoThumb.css';

interface FotoThumbProps {
  dataUrl: string;
  alt?: string;
}

const FotoThumb = ({ dataUrl, alt = 'Foto' }: FotoThumbProps) => {
  return <img className="foto-thumb" src={dataUrl} alt={alt} loading="lazy" />;
};

export default FotoThumb;
