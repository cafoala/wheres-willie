# Where's Willie 🐋

An interactive React web application for visualising recent marine mammal sightings around the UK.

## Features

- Interactive map using Leaflet
- Real-time sighting data from Seawatch Foundation
- Species-based filtering
- Detailed information panels for each species
- Displays only validated sightings with GPS coordinates from the last 31 days

## Data Sources

This application supports two data sources for marine mammal sightings:

### 1. Seawatch Foundation (Primary)

Data from the [Seawatch Foundation](https://www.seawatchfoundation.org.uk/) API provides recent cetacean sightings.

**Data Limitations:**
- **Total sightings fetched**: ~2046 records
- **Sightings with coordinates**: ~625 (30%)
- **Sightings displayed**: Only those within the last 31 days **AND** with valid coordinates (~48 currently)

Many sightings include location names but not GPS coordinates. Only sightings with coordinate data in the format `XX.XXN X.XXW` can be displayed on the map.

**Fetching Fresh Data:**

```bash
node scripts/seawatch_fetch.mjs
```

This fetches the latest sightings and saves them to `public/seawatch_combined.json`.

### 2. NBN Atlas / iRecord (Experimental)

Data from the [NBN Atlas](https://nbnatlas.org/) aggregates wildlife records from across the UK, including iRecord submissions.

**Features:**
- Comprehensive coverage of all marine mammal species (whales, dolphins, seals)
- All records include GPS coordinates
- Rich metadata (observer, verification status, data provider)
- Historical data available (can fetch records from multiple years)

**Fetching iRecord Data:**

```bash
# Fetch all marine mammals from last 2 years
node scripts/irecord_fetch.mjs --years-ago 2

# Fetch specific species only
node scripts/irecord_fetch.mjs --species "Phocoena phocoena" --species "Tursiops truncatus"

# Limit number of records
node scripts/irecord_fetch.mjs --max-records 100 --years-ago 1

# See all options
node scripts/irecord_fetch.mjs --help
```

By default, fetches up to 1000 records per species for 19 marine mammal species and saves to `public/irecord_combined.json`.

**Note:** The iRecord data source is currently experimental. The app uses Seawatch data by default.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
node tests/seawatch_fetch.test.js
node tests/seawatch_adapter.test.js
node tests/irecord_fetch.test.js
node tests/irecord_adapter.test.js
```

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
