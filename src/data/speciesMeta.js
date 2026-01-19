// src/data/speciesMeta.js
// Keep keys EXACTLY matching your sighting "species" strings.

import humpbackImg from '../assets/species/humpback.jpg';
import greyselImg  from '../assets/species/grey-seal.jpg';
import comdolImg   from '../assets/species/common-dolphin.jpeg';

// If you don’t have real images yet, drop any placeholder jpgs into
// src/assets/species/ with these filenames. You can replace later.

export const SPECIES_META = {
  'Humpback whale': {
    commonName: 'Humpback whale',
    latin: 'Megaptera novaeangliae',
    size: '12–16 m',
    diet: 'Krill and small fish (they bubble-net feed!)',
    migrates: 'Yes — long migrations between polar feeding and tropical breeding grounds.',
    funFact: 'They sing complex songs; some can last 20 minutes and travel long distances underwater.',
    image: humpbackImg,
  },
  'Grey seal': {
    commonName: 'Grey seal',
    latin: 'Halichoerus grypus',
    size: '1.7–2.3 m',
    diet: 'Fish, squid, crustaceans.',
    migrates: 'Mostly coastal; breeds in large colonies (e.g., the Farne Islands).',
    funFact: 'Pups are born with fluffy white coats in winter.',
    image: greyselImg,
  },
  'Common dolphin': {
    commonName: 'Common dolphin',
    latin: 'Delphinus delphis',
    size: '2–2.7 m',
    diet: 'Small schooling fish (sardines, anchovies), squid.',
    migrates: 'Highly mobile; forms large, fast-moving groups offshore.',
    funFact: 'Distinct yellow/grey “hourglass” pattern on the sides.',
    image: comdolImg,
  },
};
