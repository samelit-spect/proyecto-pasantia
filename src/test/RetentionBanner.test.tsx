import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RetentionBanner from '@/components/common/RetentionBanner/RetentionBanner';

const renderBanner = () =>
  render(
    <MemoryRouter>
      <RetentionBanner />
    </MemoryRouter>
  );

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

describe('RetentionBanner', () => {
  it('no se muestra cuando faltan más de 60 días para el borrado', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
    renderBanner();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('se muestra durante los días previos al borrado anual', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20));
    renderBanner();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Borrado anual de datos programado')).toBeDefined();
    expect(screen.getByText(/31\/12\/2026/)).toBeDefined();
    expect(screen.getByText(/Faltan 41 días\./)).toBeDefined();
  });

  it('no se muestra después de la fecha de borrado (año nuevo reinicia el ciclo)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2027, 0, 10));
    renderBanner();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('se oculta al cerrarlo y no reaparece el mismo día', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 15));
    const { rerender } = renderBanner();

    screen.getByRole('button', { name: 'Cerrar aviso por hoy' }).click();
    rerender(
      <MemoryRouter>
        <RetentionBanner />
      </MemoryRouter>
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(localStorage.getItem('sipnam-retention-dismissed')).toBe('2026-12-15');
  });
});
