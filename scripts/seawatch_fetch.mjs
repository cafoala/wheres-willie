#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REGIONS_URL = 'https://api-seawatchadmin.imardis.org/web-regions';
const SIGHTINGS_URL = 'https://seawatcher.imardis.org/api/v1/recent-sightings';

const DEFAULT_OUTPUT = 'data/seawatch_combined.json';

const SIGHTING_RE = /^(?<species>.+?)\s*\(x(?<count>\d+)\)\s*:\s*(?<where>.+?)\s+at\s+(?<time>\d{2}:\d{2})\s+on\s+(?<date>\d{4}-\d{2}-\d{2})\s+by\s+(?<observer>.+?)(?:\s*-\s*(?<org>.+))?$/;

const parseArgs = (argv) => {
  const args = {
    output: DEFAULT_OUTPUT,
    includeIreland: false,
    includeRestOfWorld: false,
    regions: [],
    pretty: false,
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

export const collectSightings = async ({ includeIreland, includeRestOfWorld, regions }) => {
  const regionsPayload = await fetchJson(REGIONS_URL);
  const allRegions = Array.isArray(regionsPayload?.regions) ? regionsPayload.regions : [];

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
    '  --output <path>             Output path (default: data/seawatch_combined.json)',
    '  --include-ireland           Include Ireland regions',
    '  --include-rest-of-world     Include Rest of the World region',
    '  --region <regionNo>         Limit to specific region number (repeatable)',
    '  --pretty                    Pretty-print JSON',
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
  console.log(`Wrote ${data.sightings.length} sightings to ${args.output}`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
