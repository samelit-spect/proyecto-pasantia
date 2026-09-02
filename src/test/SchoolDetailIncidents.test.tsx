import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

beforeEach(() => {
  // matchMedia con "matches: true" → reduced motion → AnimatePresence sin
  // animaciones de salida (evita depender de timers reales en los tests).
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

interface HarnessProps {
  initialIncidents: Incident[];
  handler: (id: string, status: IncidentStatus) => Promise<void>;
}

// Simula al parent real (useSchoolDetailData): mantiene el estado optimista y
// el updatingId mientras la escritura no termina.
function Harness({ initialIncidents, handler }: HarnessProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const onChange = async (id: string, status: IncidentStatus) => {
    setUpdatingId(id);
    try {
      await handler(id, status);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, estado: status } : inc)));
    } catch {
      // el componente debe recuperarse solo aunque el parent falle
    } finally {
      setUpdatingId(null);
    }
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

const renderHarness = (handler: HarnessProps['handler'], incidents?: Incident[]) =>
  render(<Harness initialIncidents={incidents ?? [makeIncident()]} handler={handler} />);

describe('SchoolDetailIncidents — cambio de estado', () => {
  it('abre el ConfirmDialog al cambiar el estado y muestra el destino', () => {
    renderHarness(() => Promise.resolve());
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('pendiente');

    fireEvent.change(select, { target: { value: 'en_gestion' } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/¿Cambiar el estado a "En gestión"\?/)).toBeInTheDocument();
  });

  it('cancelar cierra el diálogo y el select vuelve al estado real', () => {
    renderHarness(() => Promise.resolve());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'resuelto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('pendiente');
  });

  it('confirma, llama al handler y deja el select con el nuevo estado', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    renderHarness(handler);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'en_gestion' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    expect(handler).toHaveBeenCalledWith('inc-1', 'en_gestion');

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('en_gestion');
    });
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(false);
  });

  it('si la escritura falla, el select se rehabilita y vuelve al estado real', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('denied'));
    renderHarness(handler);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'en_gestion' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(false);
    });
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('pendiente');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mientras la escritura no termina el select queda deshabilitado y luego se libera', async () => {
    let resolveOp!: () => void;
    const pending = new Promise<void>((res) => (resolveOp = res));
    renderHarness(() => pending);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'en_gestion' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    await waitFor(() => expect((select as HTMLSelectElement).disabled).toBe(true));

    resolveOp();
    await waitFor(() => expect((select as HTMLSelectElement).disabled).toBe(false));
    expect((select as HTMLSelectElement).value).toBe('en_gestion');
  });
});
