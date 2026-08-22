import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import IncidentHistory from '@/components/common/IncidentHistory/IncidentHistory';
import type { IncidentStatusEvent } from '@/types';

const event = (overrides: Partial<IncidentStatusEvent>): IncidentStatusEvent => ({
  estadoNuevo: 'en_analisis',
  cambiadoPor: 'uid-1',
  cambiadoPorNombre: 'Supervisor Test',
  fecha: Timestamp.fromDate(new Date(2026, 11, 20, 10, 15)),
  ...overrides,
});

describe('IncidentHistory', () => {
  it('no renderiza nada si no hay eventos', () => {
    const { container } = render(<IncidentHistory />);
    expect(container.firstChild).toBeNull();
    const { container: container2 } = render(<IncidentHistory events={[]} />);
    expect(container2.firstChild).toBeNull();
  });

  it('renderiza el título y los estados del historial', () => {
    render(
      <IncidentHistory
        events={[
          event({
            estadoNuevo: 'pendiente',
            cambiadoPorNombre: 'Juan Pérez',
            estadoAnterior: undefined,
          }),
          event({
            estadoNuevo: 'resuelto',
            estadoAnterior: 'pendiente',
            cambiadoPorNombre: 'Supervisor Test',
          }),
        ]}
      />
    );
    expect(screen.getByText('Historial de estados')).toBeDefined();
    expect(screen.getByText('Pendiente')).toBeDefined();
    expect(screen.getByText('Resuelto')).toBeDefined();
    expect(screen.getByText(/Creado por Juan Pérez/)).toBeDefined();
    expect(screen.getByText(/por Supervisor Test/)).toBeDefined();
  });
});
