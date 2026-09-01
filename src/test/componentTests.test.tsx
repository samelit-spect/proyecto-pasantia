import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SchoolDetailToday from '@/components/supervisor/SchoolDetailToday/SchoolDetailToday';
import SchoolDetailFeedback from '@/components/supervisor/SchoolDetailFeedback/SchoolDetailFeedback';
import useFeedback from '@/hooks/useFeedback';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import type { Attendance, DocenteAttendance, News, Incident, School } from '@/types';

const mockGetSchools = vi.fn();
const mockGetSchoolById = vi.fn();

const hasRole = (r: string[]) => r.includes('supervisor');
const authValue = { profile: { uid: 'u-1', escuelaId: '' }, hasRole };

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authValue,
}));

vi.mock('@/services/api/firestore', () => ({
  getSchools: (...args: unknown[]) => mockGetSchools(...args),
  getSchoolById: (...args: unknown[]) => mockGetSchoolById(...args),
}));

const makeAttendance = (id: string, registros: number = 3): Attendance =>
  ({
    id,
    escuelaId: 'esc-1',
    cargadoPor: 'u-1',
    cargadoPorNombre: 'Juan Pérez',
    fecha: { toDate: () => new Date() } as never,
    createdAt: { toDate: () => new Date() } as never,
    registros: Array.from({ length: registros }, (_, i) => ({
      nombre: `Alumno ${i + 1}`,
      cargo: 'alumno',
      presente: true,
    })),
  }) as unknown as Attendance;

const makeDocenteAttendance = (id: string, conFoto: boolean = false): DocenteAttendance =>
  ({
    id,
    escuelaId: 'esc-1',
    cargadoPor: 'u-1',
    cargadoPorNombre: 'Prof. López',
    fecha: { toDate: () => new Date() } as never,
    createdAt: { toDate: () => new Date() } as never,
    fotoDataUrl: conFoto ? 'data:image/jpeg;base64,abc' : '',
  }) as unknown as DocenteAttendance;

const makeNews = (id: string, tipo: string = 'evento'): News =>
  ({
    id,
    escuelaId: 'esc-1',
    cargadoPor: 'u-1',
    cargadoPorNombre: 'Juan',
    fecha: { toDate: () => new Date() } as never,
    tipo,
    hora: '10:00',
    descripcion: 'Acto de homenaje en el salón',
  }) as unknown as News;

const makeIncident = (id: string): Incident =>
  ({
    id,
    escuelaId: 'esc-1',
    cargadoPor: 'u-1',
    cargadoPorNombre: 'Juan',
    fecha: { toDate: () => new Date() } as never,
    categoria: 'rotura',
    urgencia: 'media',
    descripcion: 'Cortina rota del aula 5',
    estado: 'pendiente',
  }) as unknown as Incident;

describe('SchoolDetailToday', () => {
  it('muestra la fecha de hoy', () => {
    render(<SchoolDetailToday attendances={[]} docenteAttendances={[]} news={[]} incidents={[]} />);
    const fecha = new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(screen.getByText(new RegExp(fecha, 'i'))).toBeDefined();
  });

  it('muestra "Sin registros hoy" cuando todo está vacío', () => {
    render(<SchoolDetailToday attendances={[]} docenteAttendances={[]} news={[]} incidents={[]} />);
    const empties = screen.getAllByText('Sin registros hoy');
    expect(empties).toHaveLength(4);
  });

  it('renderiza asistencias con conteo presente/total', () => {
    const attendances = [makeAttendance('a-1', 3), makeAttendance('a-2', 5)];
    render(
      <SchoolDetailToday
        attendances={attendances}
        docenteAttendances={[]}
        news={[]}
        incidents={[]}
      />
    );
    expect(screen.getAllByText('Juan Pérez')).toHaveLength(2);
    expect(screen.getByText(/3\/3 presentes/)).toBeDefined();
    expect(screen.getByText(/5\/5 presentes/)).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('renderiza docentes con indicador de foto', () => {
    const docentes = [makeDocenteAttendance('d-1', true), makeDocenteAttendance('d-2', false)];
    render(
      <SchoolDetailToday attendances={[]} docenteAttendances={docentes} news={[]} incidents={[]} />
    );
    expect(screen.getAllByText('Prof. López')).toBeDefined();
    expect(screen.getByText(/Con foto/)).toBeDefined();
    expect(screen.getByText('Sin foto')).toBeDefined();
  });

  it('renderiza novedades con tipo y hora', () => {
    const news = [makeNews('n-1', 'evento')];
    render(
      <SchoolDetailToday attendances={[]} docenteAttendances={[]} news={news} incidents={[]} />
    );
    expect(screen.getByText('Acto de homenaje en el salón')).toBeDefined();
    expect(screen.getByText(/10:00/)).toBeDefined();
  });

  it('renderiza incidentes con categoría', () => {
    const incidents = [makeIncident('i-1')];
    render(
      <SchoolDetailToday attendances={[]} docenteAttendances={[]} news={[]} incidents={incidents} />
    );
    expect(screen.getByText('Cortina rota del aula 5')).toBeDefined();
    expect(screen.getByText(/Rotura/)).toBeDefined();
  });

  it('muestra conteo total en cada tarjeta', () => {
    const attendances = [makeAttendance('a-1'), makeAttendance('a-2'), makeAttendance('a-3')];
    const news = [makeNews('n-1')];
    render(
      <SchoolDetailToday
        attendances={attendances}
        docenteAttendances={[]}
        news={news}
        incidents={[]}
      />
    );
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });
});

describe('SchoolDetailFeedback', () => {
  it('no renderiza nada cuando feedback es null', () => {
    const { container } = render(<SchoolDetailFeedback feedback={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el mensaje con role="status"', () => {
    render(
      <SchoolDetailFeedback feedback={{ type: 'success', message: 'Guardado correctamente' }} />
    );
    expect(screen.getByRole('status').textContent).toBe('Guardado correctamente');
  });

  it('usa la clase CSS --success para tipo success', () => {
    const { container } = render(
      <SchoolDetailFeedback feedback={{ type: 'success', message: 'OK' }} />
    );
    expect(container.querySelector('.supervisor-detail__feedback--success')).toBeDefined();
  });

  it('usa la clase CSS --error para tipo error', () => {
    const { container } = render(
      <SchoolDetailFeedback feedback={{ type: 'error', message: 'Error' }} />
    );
    expect(container.querySelector('.supervisor-detail__feedback--error')).toBeDefined();
  });
});

function TestHook({ onResult }: { onResult: (val: ReturnType<typeof useFeedback>) => void }) {
  const fb = useFeedback(100);
  onResult(fb);
  return (
    <div>
      <span data-testid="feedback">{fb.feedback ? fb.feedback.message : 'null'}</span>
      <span data-testid="updatingId">{fb.updatingId ?? 'null'}</span>
      <button onClick={() => fb.start('op-1')}>start</button>
      <button onClick={() => fb.end({ type: 'success', message: 'OK' })}>end</button>
      <button onClick={() => fb.end({ type: 'error', message: 'Fail' })}>end-error</button>
      <button onClick={() => fb.clear()}>clear</button>
    </div>
  );
}

describe('useFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('start pone updatingId y limpia feedback', () => {
    let hookRef: ReturnType<typeof useFeedback>;
    render(
      <TestHook
        onResult={(v) => {
          hookRef = v;
        }}
      />
    );
    act(() => {
      hookRef!.start('op-1');
    });
    expect(screen.getByTestId('updatingId').textContent).toBe('op-1');
    expect(screen.getByTestId('feedback').textContent).toBe('null');
  });

  it('end success muestra feedback y se limpia tras autoClearMs', () => {
    let hookRef: ReturnType<typeof useFeedback>;
    render(
      <TestHook
        onResult={(v) => {
          hookRef = v;
        }}
      />
    );

    act(() => {
      hookRef!.start('op-1');
    });
    act(() => {
      hookRef!.end({ type: 'success', message: '¡Listo!' });
    });
    expect(screen.getByTestId('feedback').textContent).toBe('¡Listo!');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('feedback').textContent).toBe('null');
  });

  it('end error no se limpia automáticamente', () => {
    let hookRef: ReturnType<typeof useFeedback>;
    render(
      <TestHook
        onResult={(v) => {
          hookRef = v;
        }}
      />
    );

    act(() => {
      hookRef!.start('op-1');
    });
    act(() => {
      hookRef!.end({ type: 'error', message: 'Falla' });
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('feedback').textContent).toBe('Falla');
  });

  it('clear limpia todo', () => {
    let hookRef: ReturnType<typeof useFeedback>;
    render(
      <TestHook
        onResult={(v) => {
          hookRef = v;
        }}
      />
    );

    act(() => {
      hookRef!.start('op-1');
    });
    act(() => {
      hookRef!.end({ type: 'success', message: 'OK' });
    });
    act(() => {
      hookRef!.clear();
    });
    expect(screen.getByTestId('updatingId').textContent).toBe('null');
    expect(screen.getByTestId('feedback').textContent).toBe('null');
  });
});

const schools: School[] = [
  { id: 'esc-1', nombre: 'Escuela Norte', turno: 'Mañana', activa: true },
  { id: 'esc-2', nombre: 'Escuela Sur', turno: 'Tarde', activa: true },
];

describe('SchoolSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSchools.mockResolvedValue(schools);
    mockGetSchoolById.mockResolvedValue(schools[0]);
  });

  it('muestra "Cargando..." mientras carga', () => {
    render(<SchoolSelect value="" onChange={vi.fn()} />);
    expect(screen.getByText('Cargando escuelas...')).toBeDefined();
  });

  it('renderiza las escuelas una vez que se cargan', async () => {
    render(<SchoolSelect value="" onChange={vi.fn()} />);
    expect(await screen.findByText(/Escuela Norte/)).toBeDefined();
    expect(screen.getByText(/Escuela Sur/)).toBeDefined();
  });

  it('llama onChange con el id de la escuela al seleccionar', async () => {
    const onChange = vi.fn();
    render(<SchoolSelect value="" onChange={onChange} />);
    await screen.findByRole('combobox');
    const select = screen.getByRole('combobox');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(
        select,
        'esc-2'
      );
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('esc-2');
  });

  it('muestra "No hay escuelas" cuando el array viene vacío', async () => {
    mockGetSchools.mockResolvedValueOnce([]);
    render(<SchoolSelect value="" onChange={vi.fn()} />);
    expect(await screen.findByText('No hay escuelas disponibles')).toBeDefined();
  });
});
