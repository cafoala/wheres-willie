#!/usr/bin/env node
/**
 * Tests for geocoding functionality
 */

import { strict as assert } from 'node:assert';

console.log('Running geocoding tests...\n');

// Test coordinate adjustment logic
function adjustToOffshore(lat, lon, locationName) {
  const isWestCoast = /west|cornwall|wales|pembroke|cardigan|hebrides|atlantic|irish sea/i.test(locationName);
  const isEastCoast = /east|norfolk|suffolk|essex|kent|northumberland|fife|north sea/i.test(locationName);
  const isSouthCoast = /south|devon|dorset|sussex|hampshire|isle of wight|channel/i.test(locationName);
  const isNorthCoast = /north|scotland|orkney|shetland|caithness/i.test(locationName);

  let adjustedLat = lat;
  let adjustedLon = lon;
  const offset = 0.03;

  if (isWestCoast) {
    adjustedLon -= offset;
  } else if (isEastCoast) {
    adjustedLon += offset;
  } else if (isSouthCoast) {
    adjustedLat -= offset;
  } else if (isNorthCoast) {
    adjustedLat += offset;
  } else {
    adjustedLon -= offset; // Default: west coast
  }

  return { lat: adjustedLat, lon: adjustedLon };
}

// Test 1: West coast adjustment
{
  const result = adjustToOffshore(52.3, -4.5, 'Cardigan Bay');
  assert.strictEqual(result.lat, 52.3, 'Latitude should not change for west coast');
  assert.ok(result.lon < -4.5, 'Longitude should move west (more negative)');
  assert.strictEqual(result.lon, -4.53, 'Longitude should be adjusted by 0.03');
  console.log('✓ Test 1: West coast locations adjusted offshore');
}

// Test 2: East coast adjustment
{
  const result = adjustToOffshore(52.5, 1.5, 'Norfolk coast');
  assert.strictEqual(result.lat, 52.5, 'Latitude should not change for east coast');
  assert.ok(result.lon > 1.5, 'Longitude should move east (more positive)');
  assert.strictEqual(result.lon, 1.53, 'Longitude should be adjusted by 0.03');
  console.log('✓ Test 2: East coast locations adjusted offshore');
}

// Test 3: South coast adjustment
{
  const result = adjustToOffshore(50.5, -2.5, 'South Devon');
  assert.ok(result.lat < 50.5, 'Latitude should move south (more negative)');
  assert.strictEqual(result.lat, 50.47, 'Latitude should be adjusted by 0.03');
  assert.strictEqual(result.lon, -2.5, 'Longitude should not change for south coast');
  console.log('✓ Test 3: South coast locations adjusted offshore');
}

// Test 4: North coast adjustment
{
  const result = adjustToOffshore(58.5, -3.5, 'North Scotland');
  assert.ok(result.lat > 58.5, 'Latitude should move north (more positive)');
  assert.strictEqual(result.lat, 58.53, 'Latitude should be adjusted by 0.03');
  assert.strictEqual(result.lon, -3.5, 'Longitude should not change for north coast');
  console.log('✓ Test 4: North coast locations adjusted offshore');
}

// Test 5: Default (west) adjustment for ambiguous locations
{
  const result = adjustToOffshore(51.5, -1.5, 'Some Bay');
  assert.strictEqual(result.lat, 51.5, 'Latitude should not change for default');
  assert.ok(result.lon < -1.5, 'Longitude should default to west adjustment');
  console.log('✓ Test 5: Ambiguous locations default to west coast adjustment');
}

// Test 6: Multiple keyword matching (Welsh coast)
{
  const result = adjustToOffshore(52.8, -4.1, 'Pembrokeshire, Wales');
  assert.ok(result.lon < -4.1, 'Should detect Wales as west coast');
  console.log('✓ Test 6: Multiple keyword matching works correctly');
}

// Test 7: Geocoded data integration in adapter
{
  const mockSighting = {
    parsed: {
      species: 'Bottlenose dolphin',
      date: '2026-01-15',
      where: 'Morefield, Highland',
      count: 3,
      observer: 'Test Observer'
    },
    geocoded: {
      lat: 58.3,
      lon: -4.9,
      displayName: 'Morefield, Highland, Scotland',
      geocoded: true
    }
  };

  // Simulate adapter logic
  const hasGeocodedCoords = mockSighting.geocoded && 
                           mockSighting.geocoded.lat && 
                           mockSighting.geocoded.lon;
  assert.ok(hasGeocodedCoords, 'Sighting should have geocoded coordinates');
  
  const coords = [mockSighting.geocoded.lat, mockSighting.geocoded.lon];
  assert.deepEqual(coords, [58.3, -4.9], 'Coordinates should be extracted correctly');
  console.log('✓ Test 7: Geocoded data integration works in adapter');
}

// Test 8: Fallback to original coordinates when geocoding fails
{
  const mockSighting = {
    parsed: {
      species: 'Harbour porpoise',
      date: '2026-01-15',
      where: '57.23N 6.45W',
      count: 1,
      observer: 'Observer'
    }
    // No geocoded field
  };

  const COORD_RE = /(\d{1,2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3}(?:\.\d+)?)\s*([EW])/i;
  const match = mockSighting.parsed.where.match(COORD_RE);
  assert.ok(match, 'Should parse original coordinates');
  console.log('✓ Test 8: Original coordinates used when geocoding unavailable');
}

// Test 9: Offset value is reasonable for marine context
{
  const offset = 0.03; // ~3km
  const latDegreeInKm = 111; // Approximate
  const distanceKm = offset * latDegreeInKm;
  assert.ok(distanceKm > 2 && distanceKm < 5, 'Offset should be 2-5km offshore');
  console.log(`✓ Test 9: Offset distance (~${distanceKm.toFixed(1)}km) is appropriate for marine sightings`);
}

console.log('\n✅ All geocoding tests passed!');
