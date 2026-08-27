import { useEffect, useState } from 'react';
import { subscribeLast30DaysAttendance, type DailyAttendanceCount } from '@/services/api/firestore';
import './AttendanceHeatMap.css';

export default function AttendanceHeatMap() {
  const [data, setData] = useState<DailyAttendanceCount[]>([]);

  useEffect(() => {
    const unsub = subscribeLast30DaysAttendance(setData);
    return unsub;
  }, []);

  if (data.length === 0) return null;

  const maxCount = Math.max(1, ...data.map((d) => d.count));

  const getLevel = (count: number): number => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  return (
    <div className="heatmap">
      <h3 className="heatmap__title">Asistencia — últimos 30 días</h3>
      <div className="heatmap__grid">
        {data.map((d) => {
          const dt = new Date(d.date + 'T12:00:00');
          const level = getLevel(d.count);
          return (
            <div
              key={d.date}
              className={`heatmap__cell heatmap__cell--level-${level}`}
              title={`${dt.toLocaleDateString('es-AR')} — ${d.count} asistencia${d.count !== 1 ? 's' : ''}`}
            >
              <span className="heatmap__sr">{d.date}: {d.count}</span>
            </div>
          );
        })}
      </div>
      <div className="heatmap__legend">
        <span className="heatmap__legend-label">Menos</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`heatmap__legend-cell heatmap__cell--level-${l}`} />
        ))}
        <span className="heatmap__legend-label">Más</span>
      </div>
    </div>
  );
}
