import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import NotFound from '@/pages/NotFound/NotFound';
import { renderWithRouter } from './test-utils';

describe('NotFound', () => {
  it('muestra el mensaje de página no encontrada', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('Página no encontrada')).toBeDefined();
  });

  it('muestra la descripción del error', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('La ruta que buscas no existe.')).toBeDefined();
  });
});
