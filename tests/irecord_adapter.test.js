import { describe, it, expect } from 'vitest';

import {
  parseCoordinates,
  parseEventDate,
  isWithinLastDays,
  getDisplayName,
  formatLocation,
  formatObserver,
  adaptOccurrence,
  adaptIRecordData,
} from '../src/data/irecordAdapter.js';

describe('irecordAdapter', () => {
  it('parseCoordinates extracts lat/lng', () => {
    const withCoords = { decimalLatitude: 51.5, decimalLongitude: -0.1 };
    expect(parseCoordinates(withCoords)).toEqual([51.5, -0.1]);

    const noCoords = { scientificName: 'Test' };
    expect(parseCoordinates(noCoords)).toBeNull();
  });

  it('parseEventDate parses different date formats', () => {
    const withTimestamp = { eventDate: 1640995200000 }; // 2022-01-01
    const date1 = parseEventDate(withTimestamp);
    expect(date1).toBeInstanceOf(Date);
    expect(date1.getFullYear()).toBe(2022);

    const withYearMonth = { year: 2023, month: '06' };
    const date2 = parseEventDate(withYearMonth);
    expect(date2).toBeInstanceOf(Date);
    expect(date2.getFullYear()).toBe(2023);
    expect(date2.getMonth()).toBe(5); // 0-indexed
  });

  it('isWithinLastDays filters by recency', () => {
    const now = Date.now();
    const recent = { eventDate: now - 10 * 24 * 60 * 60 * 1000 }; // 10 days ago
    expect(isWithinLastDays(recent, 31)).toBe(true);
    expect(isWithinLastDays(recent, 5)).toBe(false);
  });

  it('getDisplayName prefers vernacular over scientific', () => {
    const withCommon = { vernacularName: 'Harbour Porpoise', scientificName: 'Phocoena phocoena' };
    expect(getDisplayName(withCommon)).toBe('Harbour Porpoise');

    const scientificOnly = { scientificName: 'Phocoena phocoena' };
    expect(getDisplayName(scientificOnly)).toBe('Phocoena phocoena');
  });

  it('formatLocation includes province and grid ref', () => {
    const withProvince = { stateProvince: 'Scotland', gridReference: 'NT3173' };
    const location = formatLocation(withProvince);
    expect(location).toContain('Scotland');
    expect(location).toContain('NT3173');
  });

  it('formatObserver handles array and string', () => {
    const withArray = { recordedBy: ['John Doe', 'Jane Smith'] };
    expect(formatObserver(withArray)).toBe('John Doe, Jane Smith');

    const withString = { recordedBy: 'John Doe' };
    expect(formatObserver(withString)).toBe('John Doe');
  });

  it('adaptOccurrence transforms valid occurrence', () => {
    const validOccurrence = {
      uuid: 'test-123',
      scientificName: 'Phocoena phocoena',
      vernacularName: 'Harbour Porpoise',
      decimalLatitude: 55.5,
      decimalLongitude: -5.5,
      eventDate: 1640995200000,
      year: 2022,
      month: '01',
      stateProvince: 'Scotland',
      gridReference: 'NR65',
      recordedBy: ['Test Observer'],
      dataProviderName: 'Test Provider',
      identificationVerificationStatus: 'Accepted',
    };

    const adapted = adaptOccurrence(validOccurrence);
    expect(adapted).toBeTruthy();
    expect(adapted.id).toBe('test-123');
    expect(adapted.species).toBe('Harbour Porpoise');
    expect(adapted.lat).toBe(55.5);
    expect(adapted.lng).toBe(-5.5);
    expect(adapted.source).toBe('iRecord');
    expect(adapted.date).toBeTruthy();
  });

  it('adaptOccurrence rejects missing coordinates', () => {
    const noCoords = { scientificName: 'Test', eventDate: Date.now() };
    expect(adaptOccurrence(noCoords)).toBeNull();
  });

  it('adaptIRecordData filters by date and coordinates', () => {
    const now = Date.now();
    const mockData = {
      occurrences: [
        {
          uuid: '1',
          scientificName: 'Species A',
          decimalLatitude: 51,
          decimalLongitude: -1,
          eventDate: now - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        },
        {
          uuid: '2',
          scientificName: 'Species B',
          decimalLatitude: 52,
          decimalLongitude: -2,
          eventDate: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago
        },
        {
          uuid: '3',
          scientificName: 'Species C',
          eventDate: now - 5 * 24 * 60 * 60 * 1000,
        },
      ],
    };

    const adapted = adaptIRecordData(mockData, 31);
    expect(adapted).toHaveLength(1);
    expect(adapted[0].id).toBe('1');
  });
});
