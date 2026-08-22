import { useAutoAnimate } from '@formkit/auto-animate/react';
import './Timeline.css';

export interface TimelineEvent {
  id: string;
  type: 'asistencia' | 'novedades' | 'incidentes';
  text: string;
  time?: string;
  extra?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline = ({ events }: TimelineProps) => {
  const [parent] = useAutoAnimate();
  return (
    <div className="timeline" ref={parent}>
      {events.map((event, index) => (
        <div
          key={event.id}
          className="timeline__item"
          style={{ animationDelay: `${0.05 * (index + 1)}s` }}
        >
          <div className="timeline__track">
            <div className={`timeline__dot timeline__dot--${event.type}`} />
            {index < events.length - 1 && <div className="timeline__line" />}
          </div>
          <div className="timeline__content">
            <span className="timeline__text">{event.text}</span>
            <div className="timeline__meta">
              {event.extra && <span className="timeline__extra">{event.extra}</span>}
              {event.time && <span className="timeline__time">{event.time}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
