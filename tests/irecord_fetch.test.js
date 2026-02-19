import { describe, it, expect } from 'vitest';

import { collectOccurrences } from '../scripts/irecord_fetch.mjs';

describe('irecord_fetch', () => {
  it('collectOccurrences fetches single species', async () => {
    const options = {
      species: ['Phocoena phocoena'],
      pageSize: 10,
      maxRecords: 20,
      yearsAgo: 2,
    };

    const result = await collectOccurrences(options);

    expect(result).toBeTruthy();
    expect(typeof result.fetchedAt).toBe('string');
    expect(result.source).toBe('NBN Atlas (iRecord)');
    expect(Array.isArray(result.occurrences)).toBe(true);
    expect(Array.isArray(result.speciesResults)).toBe(true);
    expect(result.speciesResults).toHaveLength(1);
    expect(result.speciesResults[0].scientificName).toBe('Phocoena phocoena');

    if (result.totalOccurrences > 0) {
      const occ = result.occurrences[0];
      expect(occ.uuid || occ.occurrenceID).toBeTruthy();
      expect(occ.scientificName).toBeTruthy();
      expect(typeof occ.decimalLatitude).toBe('number');
      expect(typeof occ.decimalLongitude).toBe('number');
      expect(occ.eventDate).toBeTruthy();
    }
  }, 15000);

  it('collectOccurrences fetches multiple species', async () => {
    const options = {
      species: ['Phoca vitulina', 'Halichoerus grypus'],
      pageSize: 5,
      maxRecords: 10,
      yearsAgo: 1,
    };

    const result = await collectOccurrences(options);

    expect(result.speciesResults).toHaveLength(2);
    expect(result.totalOccurrences).toBeGreaterThanOrEqual(0);

    const speciesNames = result.speciesResults.map((r) => r.scientificName);
    expect(speciesNames).toContain('Phoca vitulina');
    expect(speciesNames).toContain('Halichoerus grypus');
  }, 15000);

  it('returns valid data structure', async () => {
    const options = {
      species: ['Tursiops truncatus'],
      pageSize: 5,
      maxRecords: 5,
      yearsAgo: 5,
    };

    const result = await collectOccurrences(options);

    expect(result.fetchedAt).toBeTruthy();
    expect(result.source).toBeTruthy();
    expect(result.apiBase).toBeTruthy();
    expect(result.filters).toBeTruthy();
    expect(typeof result.totalOccurrences).toBe('number');

    if (result.speciesResults.length > 0) {
      const sr = result.speciesResults[0];
      expect(sr.scientificName).toBeTruthy();
      expect(typeof sr.totalRecords).toBe('number');
      expect(typeof sr.fetchedRecords).toBe('number');
    }
  }, 15000);
});
