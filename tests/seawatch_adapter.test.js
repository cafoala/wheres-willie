import assert from 'node:assert/strict';

import {
  adaptSeawatchData,
  isWithinLastDays,
  parseLatLngFromWhere,
} from '../src/data/seawatchAdapter.js';

const testParseLatLngFromWhere = () => {
  const coords = parseLatLngFromWhere('52.22N 4.35W');
  assert.deepEqual(coords, [52.22, -4.35]);
  assert.equal(parseLatLngFromWhere('Nonsense'), null);
};

const testIsWithinLastDays = () => {
  const now = new Date('2025-12-01T00:00:00Z');
  assert.equal(isWithinLastDays('2025-11-30', 31, now), true);
  assert.equal(isWithinLastDays('2025-10-01', 31, now), false);
};

const testAdaptSeawatchData = () => {
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
  assert.equal(adapted.length, 1);
  assert.equal(adapted[0].species, 'Bottlenose dolphin');
  assert.deepEqual([adapted[0].lat, adapted[0].lng], [52.22, -4.35]);
};

testParseLatLngFromWhere();
testIsWithinLastDays();
testAdaptSeawatchData();

console.log('Seawatch adapter tests passed.');
