import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MOCK_SIGHTINGS, SPECIES_RARITY } from '../src/data/mockSightings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertNumber = (value, message) => {
  assert(typeof value === 'number' && Number.isFinite(value), message);
};

assert(Array.isArray(MOCK_SIGHTINGS), 'MOCK_SIGHTINGS should be an array.');
assert(MOCK_SIGHTINGS.length > 0, 'MOCK_SIGHTINGS should not be empty.');

const seenIds = new Set();

for (const sighting of MOCK_SIGHTINGS) {
  assertNumber(sighting.id, 'Sighting id should be a number.');
  assert(!seenIds.has(sighting.id), `Duplicate sighting id: ${sighting.id}`);
  seenIds.add(sighting.id);

  assert(typeof sighting.species === 'string' && sighting.species.trim().length > 0,
    'Sighting species should be a non-empty string.');

  assert(typeof sighting.when === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sighting.when),
    `Sighting date should be YYYY-MM-DD (got ${sighting.when}).`);
  assert(typeof sighting.where === 'string' && sighting.where.trim().length > 0,
    'Sighting location should be a non-empty string.');

  assertNumber(sighting.lat, 'Sighting lat should be a number.');
  assertNumber(sighting.lng, 'Sighting lng should be a number.');
  assert(sighting.lat >= -90 && sighting.lat <= 90,
    `Sighting lat out of range: ${sighting.lat}`);
  assert(sighting.lng >= -180 && sighting.lng <= 180,
    `Sighting lng out of range: ${sighting.lng}`);

  assertNumber(sighting.count, 'Sighting count should be a number.');
  assert(sighting.count > 0, `Sighting count should be positive: ${sighting.count}`);

  assert(sighting.species in SPECIES_RARITY,
    `Missing rarity entry for species: ${sighting.species}`);
}

for (const [species, rarity] of Object.entries(SPECIES_RARITY)) {
  assertNumber(rarity, `Rarity for ${species} should be a number.`);
  assert(Number.isInteger(rarity) && rarity > 0,
    `Rarity for ${species} should be a positive integer.`);
}

const speciesMetaPath = path.join(repoRoot, 'src/data/speciesMeta.js');
const speciesMetaSource = fs.readFileSync(speciesMetaPath, 'utf8');

const metaKeyPattern = /['"]([^'"]+)['"]\s*:\s*{/g;
let metaMatch;
const metaSpecies = new Set();
while ((metaMatch = metaKeyPattern.exec(speciesMetaSource)) !== null) {
  metaSpecies.add(metaMatch[1]);
}

assert(metaSpecies.size > 0, 'SPECIES_META should define at least one species.');
for (const metaSpeciesName of metaSpecies) {
  assert(metaSpeciesName in SPECIES_RARITY,
    `SPECIES_META key missing from SPECIES_RARITY: ${metaSpeciesName}`);
}

const importPattern = /import\s+\w+\s+from\s+'(\.\.\/assets\/species\/[^']+)'/g;
let match;
while ((match = importPattern.exec(speciesMetaSource)) !== null) {
  const relativePath = match[1];
  const assetPath = path.resolve(path.dirname(speciesMetaPath), relativePath);
  assert(fs.existsSync(assetPath), `Missing asset file: ${assetPath}`);
}

console.log('Data integrity tests passed.');
