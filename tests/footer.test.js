import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Footer from '../src/components/Footer.jsx';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const normalize = (value) => value.replace(/\s+/g, ' ').trim();

const footerMarkup = normalize(renderToStaticMarkup(
  createElement(Footer, { zoom: 6, center: [54.5, -3] })
));

assert(footerMarkup.includes('Zoom: 6'), 'Footer should display zoom level.');
assert(footerMarkup.includes('Center: 54.50, -3.00'),
  'Footer should display formatted center coordinates.');
assert(footerMarkup.includes('OpenStreetMap contributors'),
  'Footer should include attribution.');

console.log('Footer tests passed.');
