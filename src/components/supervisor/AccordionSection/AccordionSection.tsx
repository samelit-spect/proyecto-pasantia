import { memo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Download } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  count: string;
  isExpanded: boolean;
  onToggle: () => void;
  onExport?: () => void;
  exporting?: boolean;
  children: React.ReactNode;
}

const AccordionSection = ({
  title,
  count,
  isExpanded,
  onToggle,
  onExport,
  exporting,
  children,
}: AccordionSectionProps) => {
  const [sectionRef] = useAutoAnimate();
  return (
    <div className="supervisor-detail__section" ref={sectionRef}>
      <div className="supervisor-detail__section-header-row">
        <button className="supervisor-detail__section-header" onClick={onToggle}>
          <div className="supervisor-detail__section-info">
            <span className="supervisor__section-title">{title}</span>
            <span className="supervisor__section-count">{count}</span>
          </div>
          <span
            className={`supervisor-detail__arrow ${isExpanded ? 'supervisor-detail__arrow--open' : ''}`}
          >
            ▾
          </span>
        </button>
        {onExport && (
          <button
            className="supervisor-detail__export-btn"
            onClick={onExport}
            disabled={!!exporting}
            title={`Exportar ${title.toLowerCase()} a CSV`}
          >
            <Download size={14} strokeWidth={1.5} />
            {exporting ? '...' : 'CSV'}
          </button>
        )}
      </div>
      {isExpanded && <div className="supervisor-detail__section-body">{children}</div>}
    </div>
  );
};

export default memo(AccordionSection);
