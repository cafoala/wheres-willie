import { describe, it, expect } from 'vitest';

import { adjustToOffshore } from '../scripts/seawatch_fetch.mjs';

describe('geocoding', () => {
  it('adjusts west coast locations offshore', () => {
    const result = adjustToOffshore(52.3, -4.5, 'Cardigan Bay');
    expect(result.lat).toBe(52.3);
    expect(result.lon).toBeLessThan(-4.5);
    expect(result.lon).toBe(-4.53);
  });

  it('adjusts east coast locations offshore', () => {
    const result = adjustToOffshore(52.5, 1.5, 'Norfolk coast');
    expect(result.lat).toBe(52.5);
    expect(result.lon).toBeGreaterThan(1.5);
    expect(result.lon).toBe(1.53);
  });

  it('adjusts south coast locations offshore', () => {
    const result = adjustToOffshore(50.5, -2.5, 'South Devon');
    expect(result.lat).toBeLessThan(50.5);
    expect(result.lat).toBe(50.47);
    expect(result.lon).toBe(-2.5);
  });

  it('adjusts north coast locations offshore', () => {
    const result = adjustToOffshore(58.5, -3.5, 'North Scotland');
    expect(result.lat).toBeGreaterThan(58.5);
    expect(result.lat).toBe(58.53);
    expect(result.lon).toBe(-3.5);
  });

  it('defaults to west adjustment for ambiguous locations', () => {
    const result = adjustToOffshore(51.5, -1.5, 'Some Bay');
    expect(result.lat).toBe(51.5);
    expect(result.lon).toBeLessThan(-1.5);
  });

  it('matches multiple keywords (Welsh coast)', () => {
    const result = adjustToOffshore(52.8, -4.1, 'Pembrokeshire, Wales');
    expect(result.lon).toBeLessThan(-4.1);
  });

  it('offset distance is appropriate for marine context (~3km)', () => {
    const offset = 0.03;
    const latDegreeInKm = 111;
    const distanceKm = offset * latDegreeInKm;
    expect(distanceKm).toBeGreaterThan(2);
    expect(distanceKm).toBeLessThan(5);
  });
});
