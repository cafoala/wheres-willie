# Where's Willie 🐋

An interactive React web application for visualising recent marine mammal sightings around the UK.

## Features

- Interactive map using Leaflet
- Real-time sighting data from Seawatch Foundation
- Species-based filtering
- Detailed information panels for each species
- Displays only validated sightings with GPS coordinates from the last 31 days

## Data Source

This application uses data from the [Seawatch Foundation](https://www.seawatchfoundation.org.uk/) API.

### Data Limitations

The Seawatch data includes sightings from various sources with different levels of detail:

- **Total sightings fetched**: ~2046 records
- **Sightings with coordinates**: ~625 (30%)
- **Sightings displayed**: Only those within the last 31 days **AND** with valid coordinates (~48 currently)

Many sightings include location names (e.g., "Morefield, Highland") but not GPS coordinates. Only sightings with coordinate data in the format `XX.XXN X.XXW` can be displayed on the map.

### Fetching Fresh Data

To update the sightings data:

```bash
node scripts/seawatch_fetch.mjs
```

This will fetch the latest sightings and save them to `public/seawatch_combined.json`.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
node tests/seawatch_fetch.test.js
node tests/seawatch_adapter.test.js
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
