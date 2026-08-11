import { describe, it, expect } from 'vitest';
import { canTransitionIncidentStatus, INCIDENT_STATUS_ORDER } from '@/utils/constants';

describe('INCIDENT_STATUS_ORDER', () => {
  it('define el flujo pendiente → en_analisis → en_gestion → resuelto', () => {
    expect(INCIDENT_STATUS_ORDER).toEqual(['pendiente', 'en_analisis', 'en_gestion', 'resuelto']);
  });
});

describe('canTransitionIncidentStatus', () => {
  it('permite avanzar una posición', () => {
    expect(canTransitionIncidentStatus('pendiente', 'en_analisis')).toBe(true);
    expect(canTransitionIncidentStatus('en_analisis', 'en_gestion')).toBe(true);
    expect(canTransitionIncidentStatus('en_gestion', 'resuelto')).toBe(true);
  });

  it('permite saltar hacia adelante', () => {
    expect(canTransitionIncidentStatus('pendiente', 'resuelto')).toBe(true);
    expect(canTransitionIncidentStatus('en_analisis', 'resuelto')).toBe(true);
  });

  it('no permite retroceder', () => {
    expect(canTransitionIncidentStatus('en_analisis', 'pendiente')).toBe(false);
    expect(canTransitionIncidentStatus('resuelto', 'en_gestion')).toBe(false);
    expect(canTransitionIncidentStatus('en_gestion', 'pendiente')).toBe(false);
  });

  it('no permite quedarse en el mismo estado', () => {
    expect(canTransitionIncidentStatus('pendiente', 'pendiente')).toBe(false);
    expect(canTransitionIncidentStatus('resuelto', 'resuelto')).toBe(false);
  });
});
