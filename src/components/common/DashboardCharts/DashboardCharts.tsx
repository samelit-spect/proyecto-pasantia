import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { Attendance, News, Incident } from '@/types';
import './DashboardCharts.css';

interface DashboardChartsProps {
  attendances: Attendance[];
  news: News[];
  incidents: Incident[];
}

const INCIDENT_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  en_analisis: '#3b82f6',
  en_gestion: '#8b5cf6',
  resuelto: '#16a34a',
};

const INCIDENT_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_analisis: 'En análisis',
  en_gestion: 'En gestión',
  resuelto: 'Resuelto',
};

const CATEGORIA_LABELS: Record<string, string> = {
  rotura: 'Rotura',
  filtracion: 'Filtración',
  falla_servicio: 'Falla de servicio',
  urgencia: 'Urgencia',
  seguridad: 'Seguridad',
  otro: 'Otro',
};

const DashboardCharts = ({ attendances, news, incidents }: DashboardChartsProps) => {
  const activityData = [
    { name: 'Asistencias', value: attendances.length, fill: '#166534' },
    { name: 'Novedades', value: news.length, fill: '#1e40af' },
    { name: 'Incidentes', value: incidents.length, fill: '#dc2626' },
  ];

  const statusCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    statusCounts[inc.estado] = (statusCounts[inc.estado] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: INCIDENT_LABELS[status] || status,
    value: count,
    color: INCIDENT_COLORS[status] || '#64748b',
  }));

  const categoriaCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    const cat = inc.categoria || 'otro';
    categoriaCounts[cat] = (categoriaCounts[cat] || 0) + 1;
  });
  const categoriaData = Object.entries(categoriaCounts).map(([cat, count]) => ({
    name: CATEGORIA_LABELS[cat] || cat,
    value: count,
  }));

  return (
    <div className="dashboard-charts">
      <div className="dashboard-charts__card">
        <h4 className="dashboard-charts__title">Actividad de hoy</h4>
        {attendances.length === 0 && news.length === 0 && incidents.length === 0 ? (
          <p className="dashboard-charts__empty">Sin datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {statusData.length > 0 && (
        <div className="dashboard-charts__card">
          <h4 className="dashboard-charts__title">Estado de incidentes</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoriaData.length > 0 && (
        <div className="dashboard-charts__card">
          <h4 className="dashboard-charts__title">Incidentes por categoría</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={categoriaData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                }}
              />
              <Bar dataKey="value" fill="var(--primary-color)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
