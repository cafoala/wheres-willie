import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './styles/layout.css';

import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import InfoBar from './components/InfoBar.jsx';
import MapShell from './components/MapShell.jsx';
import Footer from './components/Footer.jsx';

import { SPECIES_RARITY } from './data/speciesRarity.js';
import { SPECIES_META } from './data/speciesMeta.js';
import { adaptSeawatchData } from './data/seawatchAdapter.js';


export default function App() {
  const [zoom, setZoom] = useState(6);
  const [center, setCenter] = useState([54.8, -3.2]);
  const [selected, setSelected] = useState(new Set(Object.keys(SPECIES_RARITY)));
  const [rareOnly, setRareOnly] = useState(false);
  const [activeSighting, setActiveSighting] = useState(null);
  const [liveSightings, setLiveSightings] = useState([]);
  const [recencyDays, setRecencyDays] = useState(31);

  useEffect(() => {
    let isMounted = true;
    fetch('/seawatch_combined.json')
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (!isMounted || !data) return;
        setLiveSightings(adaptSeawatchData(data, { days: recencyDays }));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [recencyDays]);

  const speciesList = useMemo(() => {
    const species = new Set(Object.keys(SPECIES_RARITY));
    liveSightings.forEach(s => {
      if (s.species) species.add(s.species);
    });
    return Array.from(species).sort();
  }, [liveSightings]);

  useEffect(() => {
    setSelected(prev => {
      const next = new Set(prev);
      speciesList.forEach(sp => next.add(sp));
      return next;
    });
  }, [speciesList]);

  //const rarityThreshold = useMemo(() => rareOnly ? 2 : (zoom <= 4 ? 2 : zoom <= 5 ? 3 : zoom <= 6 ? 4 : 5), [zoom, rareOnly]);
  const rarityThreshold = 5
  const filtered = useMemo(() => {
    return liveSightings.filter(s => {
      const r = SPECIES_RARITY[s.species] ?? 5;
      const colony = s.count >= 50;
      const passesRarity = r <= rarityThreshold || colony;
      const passesToggle = selected.has(s.species);
      return passesRarity && passesToggle;
    });
  }, [rarityThreshold, selected, liveSightings]);

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
        speciesList={speciesList}
        selected={selected}
        onToggle={toggleSpecies}
        recencyDays={recencyDays}
        onRecencyChange={setRecencyDays}
      />
      <main className="main">
        <MapShell
          zoom={zoom}
          center={center}
          sightings={filtered}
          onZoomChange={setZoom}
          onCenterChange={setCenter}
          onSelect={setActiveSighting}
        />
      </main>
      <InfoBar
        selected={activeSighting}
        meta={activeSighting ? SPECIES_META[activeSighting.species] : null}
      />
      <Footer zoom={zoom} center={center} />
    </div>
  );
}
