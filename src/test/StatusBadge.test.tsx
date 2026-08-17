import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/common/StatusBadge/StatusBadge';
import type { IncidentStatus } from '@/types';

describe('StatusBadge', () => {
  it('renderiza "Pendiente" para estado pendiente', () => {
    render(<StatusBadge status="pendiente" />);
    expect(screen.getByText('Pendiente')).toBeDefined();
  });

  it('renderiza "En análisis" para estado en_analisis', () => {
    render(<StatusBadge status="en_analisis" />);
    expect(screen.getByText('En análisis')).toBeDefined();
  });

  it('renderiza "En gestión" para estado en_gestion', () => {
    render(<StatusBadge status="en_gestion" />);
    expect(screen.getByText('En gestión')).toBeDefined();
  });

  it('renderiza "Resuelto" para estado resuelto', () => {
    render(<StatusBadge status="resuelto" />);
    expect(screen.getByText('Resuelto')).toBeDefined();
  });

  it('aplica la clase CSS correcta para cada estado', () => {
    const statuses: { status: IncidentStatus; className: string }[] = [
      { status: 'pendiente', className: 'status-badge--pendiente' },
      { status: 'en_analisis', className: 'status-badge--analisis' },
      { status: 'en_gestion', className: 'status-badge--gestion' },
      { status: 'resuelto', className: 'status-badge--resuelto' },
    ];

    statuses.forEach(({ status, className }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      const badge = screen.getByText(
        status === 'pendiente'
          ? 'Pendiente'
          : status === 'en_analisis'
            ? 'En análisis'
            : status === 'en_gestion'
              ? 'En gestión'
              : 'Resuelto'
      );
      expect(badge.className).toContain(className);
      unmount();
    });
  });
});
