import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchoolDetailIncidents from '@/components/supervisor/SchoolDetailIncidents/SchoolDetailIncidents';
import type { Incident, IncidentStatus } from '@/types';

const makeIncident = (id = 'inc-1', estado: IncidentStatus = 'pendiente'): Incident =>
  ({
    id,
    escuelaId: 'esc-1',
    cargadoPor: 'u-1',
    cargadoPorNombre: 'Juan',
    fecha: { toDate: () => new Date('2026-09-02T12:00:00') } as never,
    categoria: 'rotura',
    urgencia: 'media',
    descripcion: 'Vidrio roto en el aula 3',
    ubicacion: 'Aula 3',
    estado,
  }) as unknown as Incident;

interface HarnessProps {
  initialState?: IncidentStatus;
  handler: (id: string, status: IncidentStatus) => Promise<void>;
  pending?: boolean;
}

// Simula al parent real (useSchoolDetailData): mantiene el estado optimista y
// el updatingId mientras la escritura no termina.
function Harness({ initialState, handler, pending }: HarnessProps) {
  const [incidents, setIncidents] = useState<Incident[]>(() => [
    makeIncident('inc-1', initialState ?? 'pendiente'),
  ]);
  const [updatingId, setUpdatingId] = useState<string | null>(pending ? 'inc-1' : null);

  const onChange = (id: string, status: IncidentStatus) => {
    setUpdatingId(id);
    return handler(id, status)
      .then(() => {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, estado: status } : inc))
        );
      })
      .catch(() => {
        // el componente debe recuperarse solo aunque el parent falle
      })
      .finally(() => setUpdatingId(null));
  };

  return (
    <SchoolDetailIncidents
      incidents={incidents}
      expandedSection="incidentes"
      onToggle={() => {}}
      onStatusChange={onChange}
      statusUpdatingId={updatingId}
      onLightbox={() => {}}
    />
  );
}

const renderHarness = (props: HarnessProps) => render(<Harness {...props} />);

describe('SchoolDetailIncidents — cambio de estado por botones', () => {
  it('muestra los estados alcanzables como botones y el actual solo como badge', () => {
    renderHarness({ handler: () => Promise.resolve() });

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'En análisis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'En gestión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resuelto' })).toBeInTheDocument();
  });

  it('no muestra transiciones previas ni el estado actual como botón', () => {
    renderHarness({ initialState: 'en_gestion', handler: () => Promise.resolve() });

    expect(screen.getByRole('button', { name: 'Resuelto' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pendiente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En análisis' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En gestión' })).not.toBeInTheDocument();
  });

  it('un toque llama al handler con el destino correcto', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    renderHarness({ handler });

    fireEvent.click(screen.getByRole('button', { name: 'En gestión' }));

    expect(handler).toHaveBeenCalledWith('inc-1', 'en_gestion');
    await waitFor(() => {
      expect(screen.getByText('En gestión')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Resuelto' })).toBeInTheDocument();
  });

  it('si la escritura falla, los botones se rehabilitan y no hay nuevo estado', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('denied'));
    renderHarness({ handler });

    fireEvent.click(screen.getByRole('button', { name: 'En gestión' }));

    await waitFor(() => {
      expect(
        (screen.getByRole('button', { name: 'En gestión' }) as HTMLButtonElement).disabled
      ).toBe(false);
    });
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('mientras la escritura no termina los botones quedan deshabilitados', () => {
    renderHarness({ handler: () => Promise.resolve(), pending: true });

    for (const name of ['En análisis', 'En gestión', 'Resuelto']) {
      expect((screen.getByRole('button', { name }) as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('cuando el incidente está resuelto no hay transiciones disponibles', () => {
    renderHarness({ initialState: 'resuelto', handler: () => Promise.resolve() });

    fireEvent.click(screen.getByRole('checkbox', { name: /Mostrar resueltos/i }));

    expect(screen.getByText('Sin transiciones disponibles')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En análisis' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'En gestión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resuelto' })).not.toBeInTheDocument();
  });
});
