// src/data/mockSightings.js

// Smaller number = rarer (your rule)
export const SPECIES_RARITY = {
  'Humpback whale': 1,
  'Fin whale': 1,
  'Minke whale': 2,
  'Bottlenose dolphin': 3,
  'Common dolphin': 4,
  'Harbour porpoise': 5,
  'Grey seal': 3,
  'Common/Harbour seal': 4,
};

// Minimal mock points (lat, lng as NUMBERS; UK-ish coords)
export const MOCK_SIGHTINGS = [
  { id: 1, species: 'Humpback whale',   when: '2025-10-01', where: 'Isle of Skye',  lat: 57.30, lng: -6.30, count: 1 },
  { id: 2, species: 'Minke whale',      when: '2025-09-30', where: 'Isle of Mull',  lat: 56.50, lng: -6.20, count: 2 },
  { id: 3, species: 'Common dolphin',   when: '2025-10-07', where: 'Mount’s Bay',   lat: 50.10, lng: -5.00, count: 20 },
  { id: 4, species: 'Harbour porpoise', when: '2025-10-03', where: 'South Devon',   lat: 50.30, lng: -3.80, count: 3  },
  { id: 5, species: 'Grey seal',        when: '2025-10-06', where: 'Farne Islands', lat: 55.60, lng: -1.63, count: 150 },
];
