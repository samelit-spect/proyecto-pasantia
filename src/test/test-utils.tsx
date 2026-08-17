import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

function createTestRouter(entries: { path: string; element: ReactNode }[]) {
  return createMemoryRouter(
    entries.map((e) => ({ path: e.path, element: e.element })),
    { initialEntries: entries.map((e) => e.path) }
  );
}

export function renderWithRouter(
  ui: ReactNode,
  options?: { route?: string } & Omit<RenderOptions, 'wrapper'>
) {
  const route = options?.route ?? '/';
  const router = createTestRouter([{ path: route, element: ui }]);
  const result = render(<RouterProvider router={router} />, options);
  return { ...result, router };
}
