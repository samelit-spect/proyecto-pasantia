import { memo } from 'react';
import { ClipboardCheck, Users, Newspaper, AlertTriangle } from 'lucide-react';
import type { Attendance, DocenteAttendance, News, Incident } from '@/types';
import { novedadTipoLabel, incidentCategoriaLabel } from '@/utils/constants';

interface SchoolDetailTodayProps {
  attendances: Attendance[];
  docenteAttendances: DocenteAttendance[];
  news: News[];
  incidents: Incident[];
}

const SchoolDetailToday = ({
  attendances,
  docenteAttendances,
  news,
  incidents,
}: SchoolDetailTodayProps) => (
  <div className="supervisor-detail__today">
    <p className="supervisor-detail__today-date">
      {new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </p>

    <div className="supervisor-detail__today-grid">
      <div className="supervisor-detail__today-card supervisor-detail__today-card--asistencia">
        <div className="supervisor-detail__today-card-icon">
          <ClipboardCheck size={20} strokeWidth={1.5} />
        </div>
        <div className="supervisor-detail__today-card-header">
          <span className="supervisor-detail__today-card-count">{attendances.length}</span>
          <span className="supervisor-detail__today-card-label">Asistencia de gestión</span>
        </div>
        {attendances.length === 0 ? (
          <span className="supervisor-detail__today-empty">Sin registros hoy</span>
        ) : (
          <div className="supervisor-detail__today-list">
            {attendances.map((a) => (
              <div key={a.id} className="supervisor-detail__today-item">
                <span>{a.cargadoPorNombre}</span>
                <span className="supervisor-detail__today-item-detail">
                  {a.registros.filter((r) => r.existe !== false && r.presente).length}/{a.registros.filter((r) => r.existe !== false).length} presentes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="supervisor-detail__today-card supervisor-detail__today-card--docentes">
        <div className="supervisor-detail__today-card-icon">
          <Users size={20} strokeWidth={1.5} />
        </div>
        <div className="supervisor-detail__today-card-header">
          <span className="supervisor-detail__today-card-count">{docenteAttendances.length}</span>
          <span className="supervisor-detail__today-card-label">Asistencia del profesorado</span>
        </div>
        {docenteAttendances.length === 0 ? (
          <span className="supervisor-detail__today-empty">Sin registros hoy</span>
        ) : (
          <div className="supervisor-detail__today-list">
            {docenteAttendances.map((a) => (
              <div key={a.id} className="supervisor-detail__today-item">
                <span>{a.cargadoPorNombre}</span>
                <span className="supervisor-detail__today-item-detail">
                  {a.fotoDataUrl ? '📷 Con foto' : 'Sin foto'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="supervisor-detail__today-card supervisor-detail__today-card--novedades">
        <div className="supervisor-detail__today-card-icon">
          <Newspaper size={20} strokeWidth={1.5} />
        </div>
        <div className="supervisor-detail__today-card-header">
          <span className="supervisor-detail__today-card-count">{news.length}</span>
          <span className="supervisor-detail__today-card-label">Novedades</span>
        </div>
        {news.length === 0 ? (
          <span className="supervisor-detail__today-empty">Sin registros hoy</span>
        ) : (
          <div className="supervisor-detail__today-list">
            {news.map((n) => (
              <div key={n.id} className="supervisor-detail__today-item">
                <span className="supervisor-detail__today-item-desc">{n.descripcion}</span>
                <span className="supervisor-detail__today-item-detail">
                  {novedadTipoLabel(n.tipo)}
                  {n.hora ? ` · ${n.hora}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="supervisor-detail__today-card supervisor-detail__today-card--incidentes">
        <div className="supervisor-detail__today-card-icon">
          <AlertTriangle size={20} strokeWidth={1.5} />
        </div>
        <div className="supervisor-detail__today-card-header">
          <span className="supervisor-detail__today-card-count">{incidents.length}</span>
          <span className="supervisor-detail__today-card-label">Accidentes edilicios</span>
        </div>
        {incidents.length === 0 ? (
          <span className="supervisor-detail__today-empty">Sin registros hoy</span>
        ) : (
          <div className="supervisor-detail__today-list">
            {incidents.map((inc) => (
              <div key={inc.id} className="supervisor-detail__today-item">
                <span className="supervisor-detail__today-item-desc">{inc.descripcion}</span>
                <span className="supervisor-detail__today-item-detail">
                  {incidentCategoriaLabel(inc.categoria)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default memo(SchoolDetailToday);
