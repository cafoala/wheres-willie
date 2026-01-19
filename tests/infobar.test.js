import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InfoBar from '../src/components/InfoBar.jsx';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const normalize = (value) => value.replace(/\s+/g, ' ').trim();

const infoBarMarkup = normalize(renderToStaticMarkup(
  createElement(InfoBar, { zoom: 4, center: [50.1234, -4.9876] })
));

assert(infoBarMarkup.includes('Zoom: 4'), 'InfoBar should display zoom level.');
assert(infoBarMarkup.includes('Center: 50.12, -4.99'),
  'InfoBar should display formatted center coordinates.');

console.log('InfoBar tests passed.');
