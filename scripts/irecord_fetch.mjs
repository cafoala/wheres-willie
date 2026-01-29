#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// NBN Atlas API endpoints
const NBN_API_BASE = 'https://records-ws.nbnatlas.org';
const NBN_OCCURRENCE_SEARCH = `${NBN_API_BASE}/occurrences/search`;

const DEFAULT_OUTPUT = 'public/irecord_combined.json';
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_RECORDS = 1000;

// Marine mammal species to search for (scientific names)
const MARINE_MAMMALS = [
  'Phocoena phocoena',      // Harbour Porpoise
  'Tursiops truncatus',      // Bottlenose Dolphin
  'Delphinus delphis',       // Common Dolphin
  'Stenella coeruleoalba',   // Striped Dolphin
  'Lagenorhynchus albirostris', // White-beaked Dolphin
  'Lagenorhynchus acutus',   // Atlantic White-sided Dolphin
  'Globicephala melas',      // Long-finned Pilot Whale
  'Orcinus orca',            // Killer Whale / Orca
  'Grampus griseus',         // Risso's Dolphin
  'Physeter macrocephalus',  // Sperm Whale
  'Balaenoptera acutorostrata', // Minke Whale
  'Balaenoptera physalus',   // Fin Whale
  'Megaptera novaeangliae',  // Humpback Whale
  'Balaenoptera musculus',   // Blue Whale
  'Eubalaena glacialis',     // North Atlantic Right Whale
  'Phoca vitulina',          // Harbour Seal / Common Seal
  'Halichoerus grypus',      // Grey Seal
  'Ziphius cavirostris',     // Cuvier's Beaked Whale
  'Mesoplodon bidens',       // Sowerby's Beaked Whale
];

const parseArgs = (argv) => {
  const args = {
    output: DEFAULT_OUTPUT,
    maxRecords: DEFAULT_MAX_RECORDS,
    pageSize: DEFAULT_PAGE_SIZE,
    species: [],
    pretty: false,
    yearsAgo: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === '--output') {
      args.output = argv[i + 1];
      i += 1;
    } else if (current === '--max-records') {
      args.maxRecords = Number(argv[i + 1]);
      i += 1;
    } else if (current === '--page-size') {
      args.pageSize = Number(argv[i + 1]);
      i += 1;
    } else if (current === '--species') {
      args.species.push(argv[i + 1]);
      i += 1;
    } else if (current === '--years-ago') {
      args.yearsAgo = Number(argv[i + 1]);
      i += 1;
    } else if (current === '--pretty') {
      args.pretty = true;
    } else if (current === '--help') {
      args.help = true;
    }
  }

  return args;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'wheres-willie/1.0',
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};

/**
 * Fetch occurrences for a specific species from NBN Atlas
 */
const fetchSpeciesOccurrences = async (scientificName, { pageSize, maxRecords, yearsAgo }) => {
  const occurrences = [];
  let startIndex = 0;
  let totalRecords = 0;

  // Build filter query
  const fq = [
    'geospatial_kosher:true', // Only records with valid coordinates
  ];

  // Add date filter if specified
  if (yearsAgo !== null) {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - yearsAgo, now.getMonth(), now.getDate());
    const dateStr = startDate.toISOString().split('T')[0];
    fq.push(`eventDate:[${dateStr}T00:00:00Z TO *]`);
  }

  while (occurrences.length < maxRecords) {
    const params = new URLSearchParams({
      q: `scientificName:"${scientificName}"`,
      fq: fq.join(' AND '),
      pageSize: String(pageSize),
      startIndex: String(startIndex),
      sort: 'eventDate',
      dir: 'desc',
    });

    const url = `${NBN_OCCURRENCE_SEARCH}?${params}`;
    console.log(`Fetching ${scientificName} (offset ${startIndex})...`);
    
    const data = await fetchJson(url);
    totalRecords = data.totalRecords || 0;

    if (!Array.isArray(data.occurrences) || data.occurrences.length === 0) {
      break;
    }

    occurrences.push(...data.occurrences);
    startIndex += data.occurrences.length;

    // Stop if we've fetched all available records
    if (startIndex >= totalRecords || occurrences.length >= maxRecords) {
      break;
    }
  }

  return {
    scientificName,
    totalRecords,
    fetchedRecords: occurrences.length,
    occurrences: occurrences.slice(0, maxRecords),
  };
};

/**
 * Collect occurrences for multiple species
 */
export const collectOccurrences = async ({ species, pageSize, maxRecords, yearsAgo }) => {
  const speciesToFetch = species.length > 0 ? species : MARINE_MAMMALS;
  const results = [];

  for (const scientificName of speciesToFetch) {
    try {
      const result = await fetchSpeciesOccurrences(scientificName, { pageSize, maxRecords, yearsAgo });
      results.push(result);
      console.log(`  Found ${result.fetchedRecords} records for ${scientificName} (${result.totalRecords} total)`);
    } catch (error) {
      console.error(`Failed to fetch ${scientificName}: ${error.message}`);
      results.push({
        scientificName,
        error: error.message,
        occurrences: [],
      });
    }
  }

  // Flatten all occurrences into a single array
  const allOccurrences = results.flatMap((r) => r.occurrences || []);

  return {
    fetchedAt: new Date().toISOString(),
    source: 'NBN Atlas (iRecord)',
    apiBase: NBN_API_BASE,
    filters: {
      yearsAgo,
      maxRecordsPerSpecies: maxRecords,
    },
    speciesResults: results.map(r => ({
      scientificName: r.scientificName,
      totalRecords: r.totalRecords,
      fetchedRecords: r.fetchedRecords,
      error: r.error,
    })),
    totalOccurrences: allOccurrences.length,
    occurrences: allOccurrences,
  };
};

const ensureDir = async (outputPath) => {
  const dir = path.dirname(outputPath);
  if (!dir || dir === '.') return;
  await fs.mkdir(dir, { recursive: true });
};

const usage = () => {
  return [
    'Usage: node scripts/irecord_fetch.mjs [options]',
    '',
    'Options:',
    '  --output <path>           Output path (default: public/irecord_combined.json)',
    '  --max-records <n>         Max records per species (default: 1000)',
    '  --page-size <n>           Page size for API requests (default: 100)',
    '  --species <name>          Fetch specific species (repeatable, default: all marine mammals)',
    '  --years-ago <n>           Only fetch records from last N years',
    '  --pretty                  Pretty-print JSON',
    '  --help                    Show this help',
    '',
    'Examples:',
    '  # Fetch all marine mammals (default)',
    '  node scripts/irecord_fetch.mjs',
    '',
    '  # Fetch only recent records (last 2 years)',
    '  node scripts/irecord_fetch.mjs --years-ago 2',
    '',
    '  # Fetch specific species',
    '  node scripts/irecord_fetch.mjs --species "Phocoena phocoena" --species "Tursiops truncatus"',
    '',
    `Default marine mammals searched: ${MARINE_MAMMALS.length} species`,
  ].join('\n');
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  console.log('Fetching marine mammal occurrences from NBN Atlas...');
  const data = await collectOccurrences(args);
  
  await ensureDir(args.output);
  const json = JSON.stringify(data, null, args.pretty ? 2 : 0);
  await fs.writeFile(args.output, json, 'utf8');
  
  console.log(`\nWrote ${data.totalOccurrences} occurrences to ${args.output}`);
  console.log(`Species breakdown:`);
  for (const species of data.speciesResults) {
    if (species.error) {
      console.log(`  ${species.scientificName}: ERROR - ${species.error}`);
    } else {
      console.log(`  ${species.scientificName}: ${species.fetchedRecords} records`);
    }
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
