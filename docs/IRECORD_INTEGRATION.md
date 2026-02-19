# iRecord / NBN Atlas Integration

## Overview

The NBN Atlas (National Biodiversity Network Atlas) aggregates wildlife records from across the UK, including those submitted through iRecord. This integration provides an alternative data source for marine mammal sightings with broader coverage and historical depth.

## API Information

**Base URL:** `https://records-ws.nbnatlas.org`  
**Documentation:** https://api.nbnatlas.org/

**Key Features:**
- No API key required for public data access
- RESTful JSON API
- Comprehensive occurrence search with filtering
- All records include validated GPS coordinates
- Rich metadata (observer, verification status, data provider)

## Scripts

### Fetch Script: `scripts/irecord_fetch.mjs`

Fetches marine mammal occurrences from the NBN Atlas API.

**Usage:**

```bash
# Fetch all default marine mammals (19 species)
node scripts/irecord_fetch.mjs

# Fetch only recent records (last 2 years)
node scripts/irecord_fetch.mjs --years-ago 2

# Fetch specific species
node scripts/irecord_fetch.mjs --species "Phocoena phocoena" --species "Tursiops truncatus"

# Limit records per species
node scripts/irecord_fetch.mjs --max-records 500

# Custom output path
node scripts/irecord_fetch.mjs --output public/custom_output.json

# Pretty-print JSON
node scripts/irecord_fetch.mjs --pretty
```

**Options:**

- `--output <path>` - Output file path (default: `public/irecord_combined.json`)
- `--max-records <n>` - Maximum records per species (default: 1000)
- `--page-size <n>` - API page size (default: 100)
- `--species <name>` - Fetch specific species (repeatable, default: all 19 marine mammals)
- `--years-ago <n>` - Only fetch records from last N years (default: all time)
- `--pretty` - Pretty-print JSON output
- `--help` - Show help message

**Default Marine Mammal Species (19):**

Cetaceans (Whales, Dolphins, Porpoises):
- Phocoena phocoena (Harbour Porpoise)
- Tursiops truncatus (Bottlenose Dolphin)
- Delphinus delphis (Common Dolphin)
- Stenella coeruleoalba (Striped Dolphin)
- Lagenorhynchus albirostris (White-beaked Dolphin)
- Lagenorhynchus acutus (Atlantic White-sided Dolphin)
- Globicephala melas (Long-finned Pilot Whale)
- Orcinus orca (Killer Whale / Orca)
- Grampus griseus (Risso's Dolphin)
- Physeter macrocephalus (Sperm Whale)
- Balaenoptera acutorostrata (Minke Whale)
- Balaenoptera physalus (Fin Whale)
- Megaptera novaeangliae (Humpback Whale)
- Balaenoptera musculus (Blue Whale)
- Eubalaena glacialis (North Atlantic Right Whale)
- Ziphius cavirostris (Cuvier's Beaked Whale)
- Mesoplodon bidens (Sowerby's Beaked Whale)

Pinnipeds (Seals):
- Phoca vitulina (Harbour Seal / Common Seal)
- Halichoerus grypus (Grey Seal)

### Adapter: `src/data/irecordAdapter.js`

Transforms NBN Atlas occurrence records into the app's data model.

**Key Functions:**

- `parseCoordinates(occurrence)` - Extracts lat/lng from record
- `parseEventDate(occurrence)` - Converts timestamp to Date object
- `isWithinLastDays(occurrence, days)` - Date range filtering
- `getDisplayName(occurrence)` - Returns common or scientific name
- `formatLocation(occurrence)` - Formats location description
- `formatObserver(occurrence)` - Formats observer/recorder information
- `adaptOccurrence(occurrence)` - Transforms single occurrence to app format
- `adaptIRecordData(irecordData, daysRecent)` - Main adapter function

**Example Usage:**

```javascript
import { adaptIRecordData } from './src/data/irecordAdapter.js';

// Load iRecord data
const irecordData = await fetch('/irecord_combined.json').then(r => r.json());

// Get sightings from last 60 days
const sightings = adaptIRecordData(irecordData, 60);

console.log(`Found ${sightings.length} recent sightings`);
```

## Data Structure

### API Response Format

```json
{
  "fetchedAt": "2026-01-29T21:54:05.172Z",
  "source": "NBN Atlas (iRecord)",
  "apiBase": "https://records-ws.nbnatlas.org",
  "filters": {
    "yearsAgo": 2,
    "maxRecordsPerSpecies": 1000
  },
  "speciesResults": [
    {
      "scientificName": "Phocoena phocoena",
      "totalRecords": 454,
      "fetchedRecords": 34
    }
  ],
  "totalOccurrences": 75,
  "occurrences": [...]
}
```

### Occurrence Fields (NBN Atlas)

Each occurrence includes:
- `uuid` - Unique occurrence identifier
- `scientificName` - Scientific name
- `vernacularName` - Common name
- `decimalLatitude`, `decimalLongitude` - GPS coordinates
- `eventDate` - Observation date (milliseconds since epoch)
- `year`, `month` - Date components
- `stateProvince` - UK region (England, Scotland, Wales, etc.)
- `gridReference` - UK grid reference
- `recordedBy` - Observer name(s)
- `dataProviderName` - Data provider
- `dataResourceName` - Dataset name
- `identificationVerificationStatus` - Verification status
- `license` - Data license (typically CC-BY or CC-BY-NC)
- `basisOfRecord` - Type of record (typically HUMAN_OBSERVATION)
- `coordinateUncertaintyInMeters` - Precision indicator

### Adapted Format (App)

After running through `adaptIRecordData()`:

```javascript
{
  id: "uuid",
  species: "Common name",
  scientificName: "Scientific name",
  lat: 51.5,
  lng: -0.1,
  location: "Scotland, Grid: NT3173",
  gridReference: "NT3173",
  stateProvince: "Scotland",
  date: "2025-11-30T00:00:00.000Z",
  timestamp: 1764288000000,
  year: 2025,
  month: "11",
  observer: "John Doe",
  source: "iRecord",
  dataProvider: "Mammal Society",
  dataResource: "National Mammal Atlas Project",
  license: "CC-BY-NC",
  verificationStatus: "Accepted - considered correct",
  basisOfRecord: "HUMAN_OBSERVATION",
  coordinateUncertainty: 100.0,
  _raw: { /* original occurrence object */ }
}
```

## Testing

### Run Tests

```bash
# Test the fetch script
node tests/irecord_fetch.test.js

# Test the adapter
node tests/irecord_adapter.test.js
```

### Test Coverage

**Fetch Tests:**
- Single species fetching
- Multiple species fetching
- Data structure validation
- API pagination handling
- Error handling

**Adapter Tests:**
- Coordinate parsing
- Date parsing and filtering
- Name extraction (common vs scientific)
- Location formatting
- Observer formatting
- Complete occurrence transformation
- Filtering by date range and coordinate availability

## Comparison: Seawatch vs iRecord

| Feature | Seawatch Foundation | NBN Atlas / iRecord |
|---------|-------------------|-------------------|
| **Coverage** | UK waters, focused on cetaceans | All UK, all marine mammals |
| **Coordinates** | ~30% of records | 100% (filtered) |
| **Historical depth** | Recent sightings only | Decades of data available |
| **Update frequency** | Real-time submissions | Periodic (varies by dataset) |
| **Species diversity** | Primarily cetaceans | Cetaceans + pinnipeds |
| **Metadata richness** | Basic | Comprehensive |
| **Verification** | Organization-curated | Multiple verification levels |
| **API complexity** | Simple custom API | Full-featured REST API |

## Integrating iRecord Data into App

To use iRecord data in the app, modify `App.jsx`:

```javascript
// Import the iRecord adapter
import { adaptIRecordData } from './data/irecordAdapter';

// In useEffect, fetch iRecord data instead
useEffect(() => {
  fetch('/irecord_combined.json')
    .then(res => res.json())
    .then(data => {
      const adapted = adaptIRecordData(data, recencyDays);
      setSourceSightings(adapted);
    })
    .catch(err => console.error('Failed to load iRecord data:', err));
}, [recencyDays]);
```

## API Rate Limits

The NBN Atlas API does not document explicit rate limits, but best practices:
- Paginate requests (default: 100 records per page)
- Cache results locally (don't fetch on every page load)
- Use `--max-records` to limit data volume during development
- Respect the API by including a User-Agent header (already implemented)

## License and Attribution

**NBN Atlas Data License:** Individual records have their own licenses (typically CC-BY or CC-BY-NC).

**Required Attribution:** When displaying iRecord/NBN Atlas data, include attribution:
> "Data provided by the NBN Atlas and data partners"

Link: https://nbnatlas.org/

## Further Reading

- NBN Atlas API Documentation: https://api.nbnatlas.org/
- iRecord Platform: https://irecord.org.uk/
- NBN Trust: https://nbn.org.uk/
- Indicia (iRecord backend): https://www.indicia.org.uk/
