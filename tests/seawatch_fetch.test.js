import assert from 'node:assert/strict';

import { expandRegionNo, parseSightingData } from '../scripts/seawatch_fetch.mjs';

const testExpandRegionNo = () => {
  assert.deepEqual(expandRegionNo('1'), ['1']);
  assert.deepEqual(expandRegionNo('3-4'), ['3', '4']);
  assert.deepEqual(expandRegionNo('36a'), ['36a']);
};

const testParseSightingData = () => {
  const sample =
    'Humpback whale (x10) : Mousa, Shetland at 00:00 on 2025-11-30 by Bruce Meldrum - SOCS';
  const parsed = parseSightingData(sample);
  assert.equal(parsed.species, 'Humpback whale');
  assert.equal(parsed.count, 10);
  assert.equal(parsed.where, 'Mousa, Shetland');
  assert.equal(parsed.date, '2025-11-30');
  assert.equal(parsed.observer, 'Bruce Meldrum');
  assert.equal(parsed.org, 'SOCS');

  // Test hyphenated observer names
  const hyphenated = 'Harbour porpoise (x3) : Morefield, Highland at 09:14 on 2025-12-29 by conor-ryan - HWDT';
  const parsedHyphen = parseSightingData(hyphenated);
  assert.equal(parsedHyphen.observer, 'conor-ryan');
  assert.equal(parsedHyphen.org, 'HWDT');

  // Test observer without org
  const noOrg = 'Common dolphin (x5) : Ullapool at 10:00 on 2025-12-29 by solo-observer';
  const parsedNoOrg = parseSightingData(noOrg);
  assert.equal(parsedNoOrg.observer, 'solo-observer');
  assert.equal(parsedNoOrg.org, undefined);
};

testExpandRegionNo();
testParseSightingData();

console.log('Seawatch fetch tests passed.');
