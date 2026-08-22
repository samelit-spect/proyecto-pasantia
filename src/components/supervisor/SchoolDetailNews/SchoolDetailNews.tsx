import { memo } from 'react';
import type { News } from '@/types';
import { novedadTipoLabel } from '@/utils/constants';
import AccordionSection from '../AccordionSection/AccordionSection';

interface SchoolDetailNewsProps {
  news: News[];
  expandedSection: string;
  onToggle: () => void;
  onExport?: () => void;
  exporting?: boolean;
}

const SchoolDetailNews = ({
  news,
  expandedSection,
  onToggle,
  onExport,
  exporting,
}: SchoolDetailNewsProps) => (
  <AccordionSection
    title="Novedades"
    count={`${news.length} registros`}
    isExpanded={expandedSection === 'novedades'}
    onToggle={onToggle}
    onExport={onExport}
    exporting={exporting}
  >
    {news.length === 0 ? (
      <div className="supervisor-sub__empty">No hay registros de novedades.</div>
    ) : (
      news.map((n) => (
        <div key={n.id} className="supervisor-sub__record">
          <div className="supervisor-sub__record-header">
            <span className="supervisor-sub__record-date">
              {n.fecha.toDate().toLocaleDateString('es-AR')}
            </span>
            <span className="supervisor-sub__record-author">
              {novedadTipoLabel(n.tipo)}
              {n.hora ? ` · ${n.hora}` : ''}
            </span>
          </div>
          <p className="supervisor-detail__desc">{n.descripcion}</p>
          <div className="supervisor-detail__meta">
            <span className="supervisor-sub__record-author">Cargado por: {n.cargadoPorNombre}</span>
          </div>
        </div>
      ))
    )}
  </AccordionSection>
);

export default memo(SchoolDetailNews);
