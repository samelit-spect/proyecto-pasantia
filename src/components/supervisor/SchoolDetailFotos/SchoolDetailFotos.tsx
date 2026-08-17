import type { Foto } from '@/types';
import FotoThumb from '@/components/common/FotoThumb/FotoThumb';
import AccordionSection from '../AccordionSection/AccordionSection';

interface SchoolDetailFotosProps {
  fotos: Foto[];
  expandedSection: string;
  onToggle: () => void;
  onLightbox: (url: string) => void;
}

const SchoolDetailFotos = ({ fotos, expandedSection, onToggle, onLightbox }: SchoolDetailFotosProps) => (
  <AccordionSection
    title="Fotos de Planillas"
    count={`${fotos.length} fotos`}
    isExpanded={expandedSection === 'fotos'}
    onToggle={onToggle}
  >
    {fotos.length === 0 ? (
      <div className="supervisor-sub__empty">No hay fotos cargadas.</div>
    ) : (
      <div className="supervisor-detail__fotos-grid">
        {fotos.map((foto) => (
          <div key={foto.id} className="supervisor-detail__foto">
            <button
              className="supervisor-detail__foto-btn"
              onClick={() => onLightbox(foto.dataUrl)}
            >
              <FotoThumb dataUrl={foto.dataUrl} alt={foto.nombreArchivo} />
            </button>
            <div className="supervisor-detail__foto-meta">
              <span className="supervisor-sub__record-date">
                {foto.fecha.split('-').reverse().join('/')}
              </span>
              <span className="supervisor-sub__record-author">{foto.subidoPorNombre}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </AccordionSection>
);

export default SchoolDetailFotos;
