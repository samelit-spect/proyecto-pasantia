import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttendanceRow from '@/components/common/AttendanceRow/AttendanceRow';

describe('AttendanceRow', () => {
  const defaultProps = {
    nombre: 'Juan Pérez',
    cargo: 'Director',
    presente: true,
    motivo: '',
    onToggle: vi.fn(),
    onMotivoChange: vi.fn(),
  };

  it('renderiza el nombre y el cargo', () => {
    render(<AttendanceRow {...defaultProps} />);
    expect(screen.getByText('Juan Pérez')).toBeDefined();
    expect(screen.getByText('Director')).toBeDefined();
  });

  it('muestra "Presente" cuando presente es true', () => {
    render(<AttendanceRow {...defaultProps} />);
    expect(screen.getByText('Presente')).toBeDefined();
  });

  it('muestra "Ausente" cuando presente es false', () => {
    render(<AttendanceRow {...defaultProps} presente={false} />);
    expect(screen.getByText('Ausente')).toBeDefined();
  });

  it('muestra campo de motivo cuando está ausente', () => {
    render(<AttendanceRow {...defaultProps} presente={false} motivo="Enfermedad" />);
    expect(screen.getByPlaceholderText('Motivo de ausencia...')).toBeDefined();
  });

  it('no muestra campo de motivo cuando está presente', () => {
    render(<AttendanceRow {...defaultProps} />);
    expect(screen.queryByPlaceholderText('Motivo de ausencia...')).toBeNull();
  });

  it('llama a onToggle al cambiar el checkbox', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<AttendanceRow {...defaultProps} onToggle={onToggle} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('muestra error de motivo cuando existe', () => {
    render(<AttendanceRow {...defaultProps} presente={false} motivoError="Ingresá el motivo" />);
    expect(screen.getByText('Ingresá el motivo')).toBeDefined();
  });

  it('muestra input editable de nombre cuando nombreEditable es true', () => {
    render(<AttendanceRow {...defaultProps} nombreEditable onNombreChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Juan Pérez')).toBeDefined();
  });

  it('no muestra input editable de nombre por defecto', () => {
    render(<AttendanceRow {...defaultProps} />);
    expect(screen.queryByDisplayValue('Juan Pérez')).toBeNull();
  });

  it('muestra botón de remover cuando onRemove se provee', () => {
    render(<AttendanceRow {...defaultProps} onRemove={vi.fn()} />);
    expect(screen.getByTitle('Quitar integrante')).toBeDefined();
  });

  it('no muestra botón de remover por defecto', () => {
    render(<AttendanceRow {...defaultProps} />);
    expect(screen.queryByTitle('Quitar integrante')).toBeNull();
  });

  it('muestra estado "No existe" cuando existe es false', () => {
    render(<AttendanceRow {...defaultProps} existe={false} />);
    expect(screen.getByText('No existe')).toBeDefined();
  });

  it('no muestra toggle de presencia cuando existe es false', () => {
    render(<AttendanceRow {...defaultProps} existe={false} />);
    expect(screen.queryByText('Presente')).toBeNull();
    expect(screen.queryByText('Ausente')).toBeNull();
  });
});
