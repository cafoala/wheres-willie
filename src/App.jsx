import { useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './styles/layout.css';

import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import InfoBar from './components/InfoBar.jsx';
import MapShell from './components/MapShell.jsx'; // move your MapContainer code here
import Footer from './components/Footer.jsx';

// rarity map + mock data
import { SPECIES_RARITY, MOCK_SIGHTINGS } from './data/mockSightings.js';


export default function App() {
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState([54.5, -3]);
  const [selected, setSelected] = useState(new Set(Object.keys(SPECIES_RARITY)));
  const [rareOnly, setRareOnly] = useState(false);

  //const rarityThreshold = useMemo(() => rareOnly ? 2 : (zoom <= 4 ? 2 : zoom <= 5 ? 3 : zoom <= 6 ? 4 : 5), [zoom, rareOnly]);
  const rarityThreshold = 5
  const filtered = useMemo(() => {
    return MOCK_SIGHTINGS.filter(s => {
      const r = SPECIES_RARITY[s.species] ?? 5;
      const colony = s.count >= 50;
      const passesRarity = r <= rarityThreshold || colony;
      const passesToggle = selected.has(s.species);
      return passesRarity && passesToggle;
    });
  }, [rarityThreshold, selected]);

  const toggleSpecies = (sp) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(sp) ? next.delete(sp) : next.add(sp);
      return next;
    });
  };

  return (
    <div className="app-grid">
      <Header rareOnly={rareOnly} onToggleRare={setRareOnly} />
      <Sidebar
        speciesList={Object.keys(SPECIES_RARITY)}
        selected={selected}
        onToggle={toggleSpecies}
      />
      <main className="main">
        <MapShell
          zoom={zoom}
          center={center}
          sightings={filtered}
          onZoomChange={setZoom}
          onCenterChange={setCenter}
        />
      </main>
      {/* <InfoBar zoom={zoom} center={center} /> */}
      <Footer zoom={zoom} center={center} />
    </div>
  );
}
