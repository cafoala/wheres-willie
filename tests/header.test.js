import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Header from '../src/components/Header.jsx';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const headerMarkup = renderToStaticMarkup(
  createElement(Header, { rareOnly: true, onToggleRare: () => {} })
);

assert(headerMarkup.includes('Where’s Willie 🐋'), 'Header should include the app title.');
assert(/type="checkbox"[^>]*checked/.test(headerMarkup),
  'Header checkbox should be checked when rareOnly is true.');
assert(headerMarkup.includes('Rare only'), 'Header should include the Rare only label.');

console.log('Header tests passed.');
