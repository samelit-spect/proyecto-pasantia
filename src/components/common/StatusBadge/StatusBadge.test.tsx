import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

type Status = 'pendiente' | 'en_analisis' | 'en_gestion' | 'resuelto';

describe('StatusBadge', () => {
  it('muestra la etiqueta de cada estado', () => {
    const cases: Array<[Status, string]> = [
      ['pendiente', 'Pendiente'],
      ['en_analisis', 'En análisis'],
      ['en_gestion', 'En gestión'],
      ['resuelto', 'Resuelto'],
    ];

    cases.forEach(([status, label]) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
