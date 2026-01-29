#!/usr/bin/env node
/**
 * Tests for irecord_fetch.mjs
 */

import { strict as assert } from 'node:assert';
import { collectOccurrences } from '../scripts/irecord_fetch.mjs';

console.log('Running iRecord fetch tests...\n');

// Test collectOccurrences with a single species and limited results
{
  console.log('Testing collectOccurrences with single species...');
  const options = {
    species: ['Phocoena phocoena'], // Harbour Porpoise
    pageSize: 10,
    maxRecords: 20,
    yearsAgo: 2,
  };

  const result = await collectOccurrences(options);
  
  assert(result, 'Should return result object');
  assert(typeof result.fetchedAt === 'string', 'Should have fetchedAt timestamp');
  assert.equal(result.source, 'NBN Atlas (iRecord)', 'Should identify source');
  assert(Array.isArray(result.occurrences), 'Should have occurrences array');
  assert(Array.isArray(result.speciesResults), 'Should have speciesResults array');
  assert.equal(result.speciesResults.length, 1, 'Should have 1 species result');
  assert.equal(result.speciesResults[0].scientificName, 'Phocoena phocoena', 'Should match requested species');
  
  if (result.totalOccurrences > 0) {
    const occ = result.occurrences[0];
    assert(occ.uuid || occ.occurrenceID, 'Occurrence should have ID');
    assert(occ.scientificName, 'Occurrence should have scientific name');
    assert(typeof occ.decimalLatitude === 'number', 'Occurrence should have latitude');
    assert(typeof occ.decimalLongitude === 'number', 'Occurrence should have longitude');
    assert(occ.eventDate, 'Occurrence should have event date');
    console.log(`  ✓ Fetched ${result.totalOccurrences} occurrences`);
  } else {
    console.log('  ⚠ No occurrences found (may be expected for rare species/recent timeframe)');
  }
  
  console.log('✓ collectOccurrences: single species test passed');
}

// Test with multiple species
{
  console.log('\nTesting collectOccurrences with multiple species...');
  const options = {
    species: ['Phoca vitulina', 'Halichoerus grypus'], // Harbour Seal, Grey Seal
    pageSize: 5,
    maxRecords: 10,
    yearsAgo: 1,
  };

  const result = await collectOccurrences(options);
  
  assert.equal(result.speciesResults.length, 2, 'Should have 2 species results');
  assert(result.totalOccurrences >= 0, 'Should have non-negative total');
  
  // Check that species results match requested species
  const speciesNames = result.speciesResults.map(r => r.scientificName);
  assert(speciesNames.includes('Phoca vitulina'), 'Should include Harbour Seal');
  assert(speciesNames.includes('Halichoerus grypus'), 'Should include Grey Seal');
  
  console.log(`  ✓ Fetched from ${result.speciesResults.length} species`);
  for (const species of result.speciesResults) {
    console.log(`    - ${species.scientificName}: ${species.fetchedRecords} records`);
  }
  
  console.log('✓ collectOccurrences: multiple species test passed');
}

// Test data structure validation
{
  console.log('\nTesting data structure validation...');
  const options = {
    species: ['Tursiops truncatus'], // Bottlenose Dolphin
    pageSize: 5,
    maxRecords: 5,
    yearsAgo: 5, // Wider timeframe to ensure we get some data
  };

  const result = await collectOccurrences(options);
  
  // Validate top-level structure
  assert(result.fetchedAt, 'Should have fetchedAt');
  assert(result.source, 'Should have source');
  assert(result.apiBase, 'Should have apiBase URL');
  assert(result.filters, 'Should have filters object');
  assert(typeof result.totalOccurrences === 'number', 'Should have numeric totalOccurrences');
  
  // Validate species results structure
  if (result.speciesResults.length > 0) {
    const speciesResult = result.speciesResults[0];
    assert(speciesResult.scientificName, 'Species result should have scientificName');
    assert(typeof speciesResult.totalRecords === 'number', 'Species result should have totalRecords');
    assert(typeof speciesResult.fetchedRecords === 'number', 'Species result should have fetchedRecords');
  }
  
  console.log('✓ Data structure validation passed');
}

console.log('\niRecord fetch tests passed.');
