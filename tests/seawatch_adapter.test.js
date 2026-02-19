import { describe, it, expect } from 'vitest';

import {
  adaptSeawatchData,
  isWithinLastDays,
  parseLatLngFromWhere,
} from '../src/data/seawatchAdapter.js';

describe('seawatchAdapter', () => {
  it('parseLatLngFromWhere parses coordinate strings', () => {
    expect(parseLatLngFromWhere('52.22N 4.35W')).toEqual([52.22, -4.35]);
    expect(parseLatLngFromWhere('Nonsense')).toBeNull();
    expect(parseLatLngFromWhere('58.34N 5.17W')).toEqual([58.34, -5.17]);
    expect(parseLatLngFromWhere('60.00N 1.19W')).toEqual([60.00, -1.19]);
    expect(parseLatLngFromWhere('57.16N 2.08W')).toEqual([57.16, -2.08]);
    expect(parseLatLngFromWhere('58N 3W')).toEqual([58, -3]);
  });

  it('isWithinLastDays filters by date', () => {
    const now = new Date('2025-12-01T00:00:00Z');
    expect(isWithinLastDays('2025-11-30', 31, now)).toBe(true);
    expect(isWithinLastDays('2025-10-01', 31, now)).toBe(false);
  });

  it('adaptSeawatchData filters and transforms sightings', () => {
    const now = new Date('2025-12-01T00:00:00Z');
    const data = {
      sightings: [
        {
          parsed: {
            species: 'Bottlenose dolphin',
            count: 2,
            where: '52.22N 4.35W',
            date: '2025-11-30',
            observer: 'RJ',
          },
        },
        {
          parsed: {
            species: 'Common dolphin',
            count: 5,
            where: 'No coords',
            date: '2025-11-30',
          },
        },
      ],
    };
    const adapted = adaptSeawatchData(data, { now, days: 31 });
    expect(adapted).toHaveLength(1);
    expect(adapted[0].species).toBe('Bottlenose dolphin');
    expect([adapted[0].lat, adapted[0].lng]).toEqual([52.22, -4.35]);
  });
});
