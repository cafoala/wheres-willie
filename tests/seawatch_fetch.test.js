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
};

testExpandRegionNo();
testParseSightingData();

console.log('Seawatch fetch tests passed.');
