import { describe, it, expect } from 'vitest';

import { expandRegionNo, parseSightingData } from '../scripts/seawatch_fetch.mjs';

describe('seawatch_fetch', () => {
  it('expandRegionNo expands ranges', () => {
    expect(expandRegionNo('1')).toEqual(['1']);
    expect(expandRegionNo('3-4')).toEqual(['3', '4']);
    expect(expandRegionNo('36a')).toEqual(['36a']);
  });

  it('parseSightingData parses sighting strings', () => {
    const sample =
      'Humpback whale (x10) : Mousa, Shetland at 00:00 on 2025-11-30 by Bruce Meldrum - SOCS';
    const parsed = parseSightingData(sample);
    expect(parsed.species).toBe('Humpback whale');
    expect(parsed.count).toBe(10);
    expect(parsed.where).toBe('Mousa, Shetland');
    expect(parsed.date).toBe('2025-11-30');
    expect(parsed.observer).toBe('Bruce Meldrum');
    expect(parsed.org).toBe('SOCS');

    const hyphenated =
      'Harbour porpoise (x3) : Morefield, Highland at 09:14 on 2025-12-29 by conor-ryan - HWDT';
    const parsedHyphen = parseSightingData(hyphenated);
    expect(parsedHyphen.observer).toBe('conor-ryan');
    expect(parsedHyphen.org).toBe('HWDT');

    const noOrg = 'Common dolphin (x5) : Ullapool at 10:00 on 2025-12-29 by solo-observer';
    const parsedNoOrg = parseSightingData(noOrg);
    expect(parsedNoOrg.observer).toBe('solo-observer');
    expect(parsedNoOrg.org).toBeUndefined();
  });
});
