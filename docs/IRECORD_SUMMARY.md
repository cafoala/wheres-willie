# iRecord/NBN Atlas Integration - Summary

## What I've Built

I've researched and implemented a complete integration with the NBN Atlas (National Biodiversity Network) API, which aggregates wildlife records from across the UK, including iRecord submissions. This provides an alternative data source for marine mammal sightings.

## Files Created

### 1. **Fetch Script** (`scripts/irecord_fetch.mjs`)
- Fetches marine mammal occurrences from NBN Atlas API
- Searches 19 default marine mammal species (whales, dolphins, seals)
- Supports filtering by date range (e.g., last 2 years)
- Handles pagination automatically
- Configurable output path and record limits
- Command-line interface with multiple options

**Usage:**
```bash
# Fetch all marine mammals from last year
node scripts/irecord_fetch.mjs --years-ago 1

# Fetch specific species only
node scripts/irecord_fetch.mjs --species "Phocoena phocoena" --species "Tursiops truncatus"
```

### 2. **Data Adapter** (`src/data/irecordAdapter.js`)
- Transforms NBN Atlas data format into app's data model
- Filters by date range (configurable days)
- Only includes records with valid GPS coordinates
- Extracts common names, scientific names, observer info, verification status
- Provides helper functions for date parsing, location formatting

**Functions:**
- `parseCoordinates()` - Extract lat/lng
- `parseEventDate()` - Convert timestamps
- `isWithinLastDays()` - Date filtering
- `adaptIRecordData()` - Main transformation function

### 3. **Tests**
- **`tests/irecord_fetch.test.js`** - Tests API fetching logic
- **`tests/irecord_adapter.test.js`** - Tests data transformation

All tests pass ✓

### 4. **Documentation**
- **`docs/IRECORD_INTEGRATION.md`** - Comprehensive guide covering:
  - API information and endpoints
  - Script usage and options
  - Data structures (raw and adapted)
  - Comparison with Seawatch data
  - Integration instructions
  - License and attribution requirements
- **Updated `README.md`** with iRecord section

## Data Quality Comparison

### Current Test Fetch (Last 1 Year):
- **Total records fetched**: 385 occurrences
- **Date range**: January 2025 - December 2025
- **Species found**: 9 species with data (out of 19 searched)
- **Breakdown by timeframe**:
  - Last 31 days: 0 sightings
  - Last 60 days: 3 sightings
  - Last 90 days: 31 sightings
  - Last 180 days: 133 sightings
  - Last 365 days: 385 sightings

### Top Species (Last Year):
- Grey Seal (Halichoerus grypus): 200 records
- Harbour Seal (Phoca vitulina): 98 records
- Bottlenose Dolphin (Tursiops truncatus): 41 records
- Harbour Porpoise (Phocoena phocoena): 34 records
- Common Dolphin (Delphinus delphis): 5 records

### Comparison with Seawatch:

| Feature | Seawatch | iRecord/NBN |
|---------|----------|-------------|
| Total records (recent) | ~2046 | 385 (last year) |
| With coordinates | ~625 (30%) | 385 (100%) |
| Displayed (31 days) | ~48 | 0 (seasonal) |
| Coverage | Cetaceans focused | All marine mammals |
| Update frequency | Real-time | Periodic |

## How NBN Atlas API Works

**Endpoint**: `https://records-ws.nbnatlas.org/occurrences/search`

**Query Parameters**:
- `q` - Search query (e.g., `scientificName:"Phocoena phocoena"`)
- `fq` - Filter query (e.g., `geospatial_kosher:true`, date ranges)
- `pageSize` - Results per page (default: 100)
- `startIndex` - Pagination offset
- `sort` - Sort field (e.g., `eventDate`)
- `dir` - Sort direction (`asc` or `desc`)

**Response Format**: JSON with:
- `totalRecords` - Total matching records
- `occurrences` - Array of occurrence objects
- Each occurrence has: uuid, coordinates, date, species names, observer, verification status, etc.

## Key Features

### ✅ Implemented:
1. Complete API integration with pagination
2. 19 marine mammal species covered
3. Date range filtering
4. Coordinate validation (100% of records)
5. Data transformation to app format
6. Comprehensive testing
7. Full documentation

### 🔧 Ready to Integrate:
To use iRecord data in the app instead of Seawatch:

```javascript
// In App.jsx, replace the fetch URL:
fetch('/irecord_combined.json')
  .then(res => res.json())
  .then(data => {
    const adapted = adaptIRecordData(data, recencyDays);
    setSourceSightings(adapted);
  });
```

### 📊 Observations:
1. **Seasonal Data**: Marine mammal sightings are seasonal, so recent records may be sparse
2. **Coordinate Quality**: 100% of iRecord data has validated coordinates vs 30% for Seawatch
3. **Historical Depth**: NBN Atlas has years of historical data available
4. **Verification**: Records include verification status from experts
5. **Attribution**: Must credit "NBN Atlas and data partners" when displaying

## Next Steps (If You Want to Use iRecord Data)

1. **Fetch fresh data** with longer timeframe:
   ```bash
   node scripts/irecord_fetch.mjs --years-ago 2 --max-records 500
   ```

2. **Update App.jsx** to load iRecord data instead of Seawatch

3. **Add attribution** to Footer component:
   ```jsx
   <p>Data provided by the NBN Atlas and data partners</p>
   ```

4. **Consider hybrid approach**: Use Seawatch for real-time cetacean data + iRecord for seal data

5. **Adjust default recency**: Since iRecord data is less frequent, consider defaulting to 90+ days

## Files Summary

```
scripts/
  irecord_fetch.mjs          # Fetch script
src/data/
  irecordAdapter.js          # Data adapter
tests/
  irecord_fetch.test.js      # Fetch tests (integration, uses live API)
  irecord_adapter.test.js    # Adapter unit tests
docs/
  IRECORD_INTEGRATION.md     # Complete documentation
public/
  irecord_combined.json      # Output from fetch script (served to app)
```

## Testing

All tests pass:
```bash
npm test
```

## License & Attribution

**Data License**: Records have individual licenses (typically CC-BY or CC-BY-NC)

**Required Attribution**:
> "Data provided by the NBN Atlas and data partners"  
> Link: https://nbnatlas.org/

**API**: No authentication required for public data access
