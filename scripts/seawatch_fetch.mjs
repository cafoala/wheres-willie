#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REGIONS_URL = 'https://api-seawatchadmin.imardis.org/web-regions';
const SIGHTINGS_URL = 'https://seawatcher.imardis.org/api/v1/recent-sightings';

const DEFAULT_OUTPUT = 'public/seawatch_combined.json';
const GEOCODE_CACHE_FILE = 'public/geocode_cache.json';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WhereIsWillie/1.0 (marine mammal sighting tracker)';
const REQUEST_DELAY = 1100; // Nominatim requires max 1 request per second

const SIGHTING_RE = /^(?<species>.+?)\s*\(x(?<count>\d+)\)\s*:\s*(?<where>.+?)\s+at\s+(?<time>\d{2}:\d{2})\s+on\s+(?<date>\d{4}-\d{2}-\d{2})\s+by\s+(?<observer>(?:(?!\s+-\s+).)+?)(?:\s+-\s+(?<org>.+))?$/;

const parseArgs = (argv) => {
  const args = {
    output: DEFAULT_OUTPUT,
    includeIreland: false,
    includeRestOfWorld: false,
    regions: [],
    pretty: false,
    geocode: true,
    geocodeCache: GEOCODE_CACHE_FILE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === '--output') {
      args.output = argv[i + 1];
      i += 1;
    } else if (current === '--include-ireland') {
      args.includeIreland = true;
    } else if (current === '--include-rest-of-world') {
      args.includeRestOfWorld = true;
    } else if (current === '--region') {
      args.regions.push(argv[i + 1]);
      i += 1;
    } else if (current === '--pretty') {
      args.pretty = true;
    } else if (current === '--no-geocode') {
      args.geocode = false;
    } else if (current === '--geocode-cache') {
      args.geocodeCache = argv[i + 1];
      i += 1;
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
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};

// Geocoding cache
const geocodeCache = new Map();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const adjustToOffshore = (lat, lon, locationName) => {
  const lowerLocation = locationName.toLowerCase();
  const isWestCoast = /west|cornwall|wales|pembroke|cardigan|hebrides|skye|mull|atlantic|irish sea/i.test(locationName);
  const isEastCoast = /east|norfolk|suffolk|essex|kent|northumberland|fife|north sea/i.test(locationName);
  const isSouthCoast = /south|devon|dorset|sussex|hampshire|isle of wight|channel/i.test(locationName);
  const isNorthCoast = /north|scotland|orkney|shetland|caithness/i.test(locationName);

  let adjustedLat = lat;
  let adjustedLon = lon;
  const offset = 0.03; // ~3km

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
};

const geocodeLocation = async (locationName) => {
  if (geocodeCache.has(locationName)) {
    return geocodeCache.get(locationName);
  }

  try {
    await sleep(REQUEST_DELAY);

    const params = new URLSearchParams({
      q: locationName,
      format: 'json',
      limit: 1,
      countrycodes: 'gb',
      addressdetails: 1
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      console.error(`  ✗ Geocoding failed for "${locationName}": ${response.status}`);
      geocodeCache.set(locationName, null);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      geocodeCache.set(locationName, null);
      return null;
    }

    const result = results[0];
    const adjusted = adjustToOffshore(parseFloat(result.lat), parseFloat(result.lon), locationName);
    
    const coords = {
      lat: adjusted.lat,
      lon: adjusted.lon,
      displayName: result.display_name,
      geocoded: true
    };

    geocodeCache.set(locationName, coords);
    return coords;

  } catch (error) {
    console.error(`  ✗ Error geocoding "${locationName}":`, error.message);
    geocodeCache.set(locationName, null);
    return null;
  }
};

const loadGeocodeCache = async (cachePath) => {
  try {
    const data = await fs.readFile(cachePath, 'utf-8');
    const cacheData = JSON.parse(data);
    Object.entries(cacheData).forEach(([key, value]) => {
      geocodeCache.set(key, value);
    });
    console.log(`Loaded ${geocodeCache.size} cached geocoding results`);
  } catch (error) {
    console.log('No existing geocode cache found, starting fresh');
  }
};

const saveGeocodeCache = async (cachePath) => {
  const cacheObj = {};
  geocodeCache.forEach((value, key) => {
    cacheObj[key] = value;
  });
  await fs.writeFile(cachePath, JSON.stringify(cacheObj, null, 2));
  console.log(`Saved ${Object.keys(cacheObj).length} geocoding results to cache`);
};

export const expandRegionNo = (value) => {
  if (!value) return [];
  const trimmed = String(value).trim();
  if (trimmed.includes('-')) {
    const [start, end] = trimmed.split('-', 2).map((part) => part.trim());
    if (/^\d+$/.test(start) && /^\d+$/.test(end)) {
      const items = [];
      for (let num = Number(start); num <= Number(end); num += 1) {
        items.push(String(num));
      }
      return items;
    }
  }
  return [trimmed];
};

export const parseSightingData = (text) => {
  if (!text) return {};
  const match = text.trim().match(SIGHTING_RE);
  if (!match || !match.groups) {
    return { raw: text };
  }
  return {
    ...match.groups,
    count: Number(match.groups.count),
  };
};

const isUkRegion = (region, includeIreland, includeRest) => {
  const name = String(region?.region_name ?? '').trim();
  if (!includeRest && name.toLowerCase() === 'rest of the world') {
    return false;
  }
  if (!includeIreland && name.includes('Ireland')) {
    return false;
  }
  return true;
};

export const collectSightings = async ({ includeIreland, includeRestOfWorld, regions, geocode, geocodeCache: cachePath }) => {
  const regionsPayload = await fetchJson(REGIONS_URL);
  const allRegions = Array.isArray(regionsPayload?.regions) ? regionsPayload.regions : [];

  // Load geocode cache if geocoding is enabled
  if (geocode && cachePath) {
    await loadGeocodeCache(cachePath);
  }

  const regionRequests = [];
  if (regions.length > 0) {
    for (const region of regions) {
      const value = String(region ?? '').trim();
      if (value && !regionRequests.includes(value)) {
        regionRequests.push(value);
      }
    }
  } else {
    for (const region of allRegions) {
      if (!isUkRegion(region, includeIreland, includeRestOfWorld)) {
        continue;
      }
      const regionNo = String(region?.region_no ?? '').trim();
      if (regionNo && !regionRequests.includes(regionNo)) {
        regionRequests.push(regionNo);
      }
    }
  }

  const sightings = [];
  for (const regionNo of regionRequests) {
    const url = `${SIGHTINGS_URL}?regionNo=${encodeURIComponent(regionNo)}`;
    const payload = await fetchJson(url);
    if (Array.isArray(payload)) {
      for (const item of payload) {
        sightings.push({
          ...item,
          regionNoRequested: regionNo,
          parsed: parseSightingData(item?.sightingData ?? ''),
        });
      }
    }
  }

  // Enhance with geocoding if enabled
  if (geocode) {
    console.log('\nEnhancing sightings with geocoding...');
    const COORD_RE = /(\d{1,2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3}(?:\.\d+)?)\s*([EW])/i;
    const needsGeocoding = sightings.filter(s => {
      const where = s?.parsed?.where;
      return where && !COORD_RE.test(where);
    });

    console.log(`Found ${needsGeocoding.length} sightings without coordinates`);
    
    const uniqueLocations = [...new Set(needsGeocoding.map(s => s.parsed.where))];
    console.log(`Need to geocode ${uniqueLocations.length} unique locations`);
    
    let geocoded = 0;
    let failed = 0;
    
    for (let i = 0; i < uniqueLocations.length; i++) {
      const location = uniqueLocations[i];
      const progress = `[${i + 1}/${uniqueLocations.length}]`;
      
      process.stdout.write(`\r${progress} Geocoding: ${location.substring(0, 50).padEnd(50)}`);
      
      const coords = await geocodeLocation(location);
      if (coords) {
        geocoded++;
      } else {
        failed++;
      }
    }
    
    console.log(`\n\nGeocoding complete:`);
    console.log(`  ✓ Successfully geocoded: ${geocoded}`);
    console.log(`  ✗ Failed to geocode: ${failed}`);
    
    // Add geocoded data to sightings
    sightings.forEach(sighting => {
      const where = sighting?.parsed?.where;
      if (where) {
        const coords = geocodeCache.get(where);
        if (coords) {
          sighting.geocoded = coords;
        }
      }
    });

    // Save updated cache
    if (cachePath) {
      await saveGeocodeCache(cachePath);
    }
  }

  return {
    region_ids: regionRequests,
    regions: allRegions,
    sightings,
  };
};

const ensureDir = async (outputPath) => {
  const dir = path.dirname(outputPath);
  if (!dir || dir === '.') return;
  await fs.mkdir(dir, { recursive: true });
};

const usage = () => {
  return [
    'Usage: node scripts/seawatch_fetch.mjs [options]',
    '',
    'Options:',
    '  --output <path>             Output path (default: public/seawatch_combined.json)',
    '  --include-ireland           Include Ireland regions',
    '  --include-rest-of-world     Include Rest of the World region',
    '  --region <regionNo>         Limit to specific region number (repeatable)',
    '  --pretty                    Pretty-print JSON',
    '  --no-geocode                Disable automatic geocoding of location names',
    '  --geocode-cache <path>      Geocode cache file path (default: public/geocode_cache.json)',
  ].join('\n');
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const data = await collectSightings(args);
  await ensureDir(args.output);
  const json = JSON.stringify(data, null, args.pretty ? 2 : 0);
  await fs.writeFile(args.output, json, 'utf8');
  
  // Report coordinate coverage
  const COORD_RE = /(\d{1,2}(?:\.\d+)?)\s*([NS])\s+(\d{1,3}(?:\.\d+)?)\s*([EW])/i;
  const withOriginalCoords = data.sightings.filter(s => COORD_RE.test(s?.parsed?.where || '')).length;
  const withGeocodedCoords = data.sightings.filter(s => s.geocoded).length;
  const totalWithCoords = withOriginalCoords + withGeocodedCoords;
  
  console.log(`\nCoordinate coverage:`);
  console.log(`  Original with coords: ${withOriginalCoords}`);
  console.log(`  Geocoded: ${withGeocodedCoords}`);
  console.log(`  Total displayable: ${totalWithCoords}/${data.sightings.length} (${Math.round(totalWithCoords / data.sightings.length * 100)}%)`);
  console.log(`\nWrote ${data.sightings.length} sightings to ${args.output}`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
