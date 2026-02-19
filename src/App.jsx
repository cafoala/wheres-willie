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
import { adaptNbnData } from './data/nbnAdapter.js';

const SEAWATCH_RECENCY_DAYS = 31;
const NBN_RECENCY_DAYS = 90;

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

    const loadSeawatch = fetch('/seawatch_combined.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data ? adaptSeawatchData(data, { days: SEAWATCH_RECENCY_DAYS }) : []))
      .catch(() => []);

    const loadNbn = fetch('/nbn_combined.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data ? adaptNbnData(data, NBN_RECENCY_DAYS) : []))
      .catch(() => []);

    Promise.all([loadSeawatch, loadNbn]).then(([seawatchSightings, nbnSightings]) => {
      if (!isMounted) return;
      setLiveSightings([...seawatchSightings, ...nbnSightings]);
    });

    return () => { isMounted = false; };
  }, []);

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

  const rarityThreshold = 5;
  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - recencyDays * 24 * 60 * 60 * 1000);

    return liveSightings.filter((s) => {
      const when = s.when || s.date?.split('T')[0];
      if (when) {
        const d = new Date(when);
        if (!Number.isNaN(d.getTime()) && d < cutoff) return false;
      }
      const r = SPECIES_RARITY[s.species] ?? 5;
      const colony = s.count >= 50;
      const passesRarity = r <= rarityThreshold || colony;
      const passesToggle = selected.has(s.species);
      return passesRarity && passesToggle;
    });
  }, [rarityThreshold, selected, liveSightings, recencyDays]);

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
