import { describe, it, expect } from 'vitest';

import { collectOccurrences } from '../scripts/nbn_fetch.mjs';

describe('nbn_fetch', () => {
  it('collectOccurrences with daysAgo fetches recent records', async () => {
    const options = {
      species: ['Phocoena phocoena'],
      pageSize: 10,
      maxRecords: 20,
      daysAgo: 90,
    };

    const result = await collectOccurrences(options);

    expect(result).toBeTruthy();
    expect(typeof result.fetchedAt).toBe('string');
    expect(result.source).toBe('NBN Atlas');
    expect(Array.isArray(result.occurrences)).toBe(true);
    expect(result.speciesResults).toHaveLength(1);
    expect(result.filters.daysAgo).toBe(90);
  }, 15000);

  it('collectOccurrences fetches multiple species', async () => {
    const options = {
      species: ['Phoca vitulina', 'Halichoerus grypus'],
      pageSize: 5,
      maxRecords: 10,
      daysAgo: 180,
    };

    const result = await collectOccurrences(options);

    expect(result.speciesResults).toHaveLength(2);
    const names = result.speciesResults.map((r) => r.scientificName);
    expect(names).toContain('Phoca vitulina');
    expect(names).toContain('Halichoerus grypus');
  }, 15000);
});
