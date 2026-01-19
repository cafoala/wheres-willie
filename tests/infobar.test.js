import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InfoBar from '../src/components/InfoBar.jsx';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const normalize = (value) => value.replace(/\s+/g, ' ').trim();

const emptyMarkup = normalize(renderToStaticMarkup(
  createElement(InfoBar, { selected: null, meta: null })
));
assert(emptyMarkup.includes('Sighting details'),
  'InfoBar should render a placeholder title when nothing is selected.');
assert(emptyMarkup.includes('Click a marker'),
  'InfoBar should prompt users to click a marker.');

const infoBarMarkup = normalize(renderToStaticMarkup(
  createElement(InfoBar, {
    selected: {
      species: 'Grey seal',
      when: '2025-10-06',
      where: 'Farne Islands',
      count: 150,
      observer: 'A. Diver',
      org: 'SOCS',
    },
    meta: {
      commonName: 'Grey seal',
      latin: 'Halichoerus grypus',
      size: '1.7-2.3 m',
      diet: 'Fish, squid, crustaceans.',
      migrates: 'Mostly coastal.',
      funFact: 'Pups are born with fluffy white coats.',
      image: '/assets/grey-seal.jpg',
    },
  })
));

assert(infoBarMarkup.includes('Grey seal'),
  'InfoBar should display the selected species.');
assert(infoBarMarkup.includes('2025-10-06'),
  'InfoBar should display the sighting date.');
assert(infoBarMarkup.includes('Farne Islands'),
  'InfoBar should display the sighting location.');
assert(infoBarMarkup.includes('Latin name:'),
  'InfoBar should include the Latin name label.');
assert(infoBarMarkup.includes('Halichoerus grypus'),
  'InfoBar should render metadata values.');
assert(infoBarMarkup.includes('Reported by A. Diver (SOCS)'),
  'InfoBar should include observer credit.');

console.log('InfoBar tests passed.');
