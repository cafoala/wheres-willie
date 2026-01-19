import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Sidebar from '../src/components/Sidebar.jsx';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const speciesList = ['Grey seal', 'Minke whale'];
const selected = new Set(['Grey seal']);
const sidebarMarkup = renderToStaticMarkup(
  createElement(Sidebar, { speciesList, selected, onToggle: () => {} })
);

assert(sidebarMarkup.includes('Filters'), 'Sidebar should include Filters heading.');
assert(sidebarMarkup.includes('Species'), 'Sidebar should include Species heading.');
assert(sidebarMarkup.includes('Recency'), 'Sidebar should include Recency heading.');
assert(sidebarMarkup.includes('Grey seal'), 'Sidebar should render species names.');
assert(sidebarMarkup.includes('Minke whale'), 'Sidebar should render species names.');
assert(/Grey seal/.test(sidebarMarkup) && /checked/.test(sidebarMarkup),
  'Sidebar should mark selected species as checked.');

console.log('Sidebar tests passed.');
