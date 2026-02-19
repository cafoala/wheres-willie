import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

const iconFor = (species) =>
  L.divIcon({ html:`<div style="font-size:20px;line-height:20px">${pickEmoji(species)}</div>`,
              iconSize:[20,20], iconAnchor:[10,10] });

const pickEmoji = (species) => ({
  'Harbour porpoise':'🐬','Common dolphin':'🐬','Bottlenose dolphin':'🐬',
  'Minke whale':'🐋','Humpback whale':'🐋','Fin whale':'🐋','Grey seal':'🦭',
  'Harbour seal':'🦭','Common/Harbour seal':'🦭'
}[species] || '🐳');

export default function MapShell({ zoom, center, sightings, onZoomChange, onCenterChange, onSelect }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map) return;
    const handler = () => {
      onZoomChange(map.getZoom());
      const c = map.getCenter();
      onCenterChange([c.lat, c.lng]);
    };
    map.on('zoomend', handler);
    map.on('moveend', handler);
    return () => {
      map.off('zoomend', handler);
      map.off('moveend', handler);
    };
  }, [map, onZoomChange, onCenterChange]);

  return (
    <MapContainer
      whenCreated={setMap}
      center={center}
      zoom={zoom}
      minZoom={3}
      maxZoom={12}
      zoomControl={false}
      style={{height:'100%', width:'100%'}}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team"
      />
      <ZoomControl position="topright" />
      {sightings.map(s => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={iconFor(s.species)}
          eventHandlers={onSelect ? { click: () => onSelect(s) } : undefined}
        >
          <Tooltip direction="top" offset={[0,-5]} opacity={1}>
            <div style={{fontSize:12}}>
              <div style={{fontWeight:600}}>{s.species}</div>
              <div>{s.where}</div>
              <div style={{opacity:.7}}>{s.when} • count: {s.count ?? 'n/a'}</div>
              {s.observer ? (
                <div style={{opacity:.7}}>by {s.observer}{s.org ? ` (${s.org})` : ''}</div>
              ) : null}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
