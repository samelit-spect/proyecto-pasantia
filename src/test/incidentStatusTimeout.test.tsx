import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useSchoolDetailData } from '@/hooks/useSchoolDetailData';
import type { UserProfile } from '@/types';

const { mockUpdateIncidentStatus } = vi.hoisted(() => ({ mockUpdateIncidentStatus: vi.fn() }));

vi.mock('@/services/api/firestore', () => {
  const names = [
    'getSchoolById',
    'getUsersBySchool',
    'getDocentesBySchool',
    'subscribeAttendancesBySchool',
    'subscribeNewsBySchool',
    'subscribeIncidentsBySchool',
    'subscribeDocenteAttendancesBySchool',
    'subscribeFotosBySchool',
    'addDocente',
    'updateDocente',
    'setDocenteActive',
    'deleteFoto',
    'setAttendanceVerified',
    'setDocenteAttendanceVerified',
    'getAttendancesBySchool',
    'getDocenteAttendancesBySchool',
    'getNewsBySchool',
    'getIncidentsBySchool',
  ];
  const module: Record<string, unknown> = {};
  for (const name of names) {
    module[name] = vi.fn();
  }
  module.getSchoolById = vi.fn(() =>
    Promise.resolve({ id: 'esc-1', nombre: 'Test', turno: 'Mañana', activa: true })
  );
  for (const sub of names.filter((n) => n.startsWith('subscribe'))) {
    (module[sub] as ReturnType<typeof vi.fn>).mockImplementation(
      (_schoolId: string, cb: (data: unknown[]) => void) => {
        cb([]);
        return () => {};
      }
    );
  }
  for (const name of names.filter((n) => !n.startsWith('subscribe'))) {
    if (name !== 'getSchoolById') (module[name] as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  }
  module.updateIncidentStatus = mockUpdateIncidentStatus;
  return module;
});

const PROFILE = {
  uid: 'sup-1',
  nombre: 'Supervisor',
  rol: 'supervisor',
} as unknown as UserProfile;

function TimeoutHarness() {
  const { statusOp, handleStatusChange } = useSchoolDetailData({
    schoolId: 'esc-1',
    profile: PROFILE,
  });
  return (
    <div>
      <span data-testid="updating">{statusOp.updatingId ?? 'null'}</span>
      <button type="button" onClick={() => handleStatusChange('inc-1', 'en_gestion')}>
        cambiar
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateIncidentStatus.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSchoolDetailData — actualización de estado de incidentes', () => {
  it('libera el select de incidentes si Firestore tarda demasiado en responder', async () => {
    vi.useFakeTimers();
    mockUpdateIncidentStatus.mockReturnValue(new Promise<void>(() => {}));

    render(<TimeoutHarness />);
    await act(async () => {});

    expect(screen.getByTestId('updating').textContent).toBe('null');

    fireEvent.click(screen.getByRole('button', { name: 'cambiar' }));
    await act(async () => {});
    expect(screen.getByTestId('updating').textContent).toBe('inc-1');

    act(() => {
      vi.advanceTimersByTime(15_001);
    });
    await act(async () => {});

    // El select nunca queda "trabado": updatingId vuelve a null aunque la
    // escritura no haya llegado a asentarse.
    expect(screen.getByTestId('updating').textContent).toBe('null');
    expect(mockUpdateIncidentStatus).toHaveBeenCalledWith(
      'inc-1',
      'en_gestion',
      { uid: 'sup-1', nombre: 'Supervisor' },
      undefined
    );
  });

  it('limpia updatingId cuando la escritura responde con éxito', async () => {
    render(<TimeoutHarness />);
    await act(async () => {});

    fireEvent.click(screen.getByRole('button', { name: 'cambiar' }));
    await act(async () => {});

    expect(mockUpdateIncidentStatus).toHaveBeenCalled();
    expect(screen.getByTestId('updating').textContent).toBe('null');
  });
});
