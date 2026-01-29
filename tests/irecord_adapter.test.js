#!/usr/bin/env node
/**
 * Tests for irecordAdapter.js
 */

import { strict as assert } from 'node:assert';
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

console.log('Running iRecord adapter tests...\n');

// Test parseCoordinates
{
  const withCoords = { decimalLatitude: 51.5, decimalLongitude: -0.1 };
  const coords = parseCoordinates(withCoords);
  assert.deepEqual(coords, [51.5, -0.1], 'Should parse valid coordinates');
  console.log('✓ parseCoordinates: valid coordinates');
}

{
  const noCoords = { scientificName: 'Test' };
  const coords = parseCoordinates(noCoords);
  assert.equal(coords, null, 'Should return null for missing coordinates');
  console.log('✓ parseCoordinates: missing coordinates');
}

// Test parseEventDate
{
  const withTimestamp = { eventDate: 1640995200000 }; // 2022-01-01
  const date = parseEventDate(withTimestamp);
  assert(date instanceof Date, 'Should return Date object');
  assert.equal(date.getFullYear(), 2022, 'Should parse correct year');
  console.log('✓ parseEventDate: timestamp format');
}

{
  const withYearMonth = { year: 2023, month: '06' };
  const date = parseEventDate(withYearMonth);
  assert(date instanceof Date, 'Should return Date object');
  assert.equal(date.getFullYear(), 2023, 'Should parse correct year');
  assert.equal(date.getMonth(), 5, 'Should parse correct month (0-indexed)');
  console.log('✓ parseEventDate: year/month fallback');
}

// Test isWithinLastDays
{
  const now = Date.now();
  const recent = { eventDate: now - 10 * 24 * 60 * 60 * 1000 }; // 10 days ago
  assert.equal(isWithinLastDays(recent, 31), true, 'Should be within 31 days');
  assert.equal(isWithinLastDays(recent, 5), false, 'Should not be within 5 days');
  console.log('✓ isWithinLastDays: date filtering');
}

// Test getDisplayName
{
  const withCommon = { vernacularName: 'Harbour Porpoise', scientificName: 'Phocoena phocoena' };
  assert.equal(getDisplayName(withCommon), 'Harbour Porpoise', 'Should prefer common name');
  console.log('✓ getDisplayName: prefers vernacular name');
}

{
  const scientificOnly = { scientificName: 'Phocoena phocoena' };
  assert.equal(getDisplayName(scientificOnly), 'Phocoena phocoena', 'Should fallback to scientific name');
  console.log('✓ getDisplayName: fallback to scientific name');
}

// Test formatLocation
{
  const withProvince = { stateProvince: 'Scotland', gridReference: 'NT3173' };
  const location = formatLocation(withProvince);
  assert(location.includes('Scotland'), 'Should include province');
  assert(location.includes('NT3173'), 'Should include grid reference');
  console.log('✓ formatLocation: includes province and grid ref');
}

// Test formatObserver
{
  const withArray = { recordedBy: ['John Doe', 'Jane Smith'] };
  assert.equal(formatObserver(withArray), 'John Doe, Jane Smith', 'Should join array observers');
  console.log('✓ formatObserver: array format');
}

{
  const withString = { recordedBy: 'John Doe' };
  assert.equal(formatObserver(withString), 'John Doe', 'Should handle string observer');
  console.log('✓ formatObserver: string format');
}

// Test adaptOccurrence
{
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
  assert(adapted, 'Should return adapted object');
  assert.equal(adapted.id, 'test-123', 'Should preserve ID');
  assert.equal(adapted.species, 'Harbour Porpoise', 'Should use common name');
  assert.equal(adapted.lat, 55.5, 'Should extract latitude');
  assert.equal(adapted.lng, -5.5, 'Should extract longitude');
  assert.equal(adapted.source, 'iRecord', 'Should set source');
  assert(adapted.date, 'Should have date');
  console.log('✓ adaptOccurrence: complete transformation');
}

{
  const noCoords = { scientificName: 'Test', eventDate: Date.now() };
  const adapted = adaptOccurrence(noCoords);
  assert.equal(adapted, null, 'Should return null for missing coordinates');
  console.log('✓ adaptOccurrence: rejects missing coordinates');
}

// Test adaptIRecordData
{
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
        eventDate: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago (too old)
      },
      {
        uuid: '3',
        scientificName: 'Species C',
        // Missing coordinates
        eventDate: now - 5 * 24 * 60 * 60 * 1000,
      },
    ],
  };

  const adapted = adaptIRecordData(mockData, 31);
  assert.equal(adapted.length, 1, 'Should filter to 1 valid recent record');
  assert.equal(adapted[0].id, '1', 'Should include only the recent valid record');
  console.log('✓ adaptIRecordData: filters by date and coordinates');
}

console.log('\niRecord adapter tests passed.');
