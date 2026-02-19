import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InfoBar from '../src/components/InfoBar.jsx';

const normalize = (value) => value.replace(/\s+/g, ' ').trim();

describe('InfoBar', () => {
  it('renders placeholder when nothing selected', () => {
    const markup = normalize(
      renderToStaticMarkup(createElement(InfoBar, { selected: null, meta: null }))
    );
    expect(markup).toContain('Sighting details');
    expect(markup).toContain('Click a marker');
  });

  it('displays selected sighting details', () => {
    const markup = normalize(
      renderToStaticMarkup(
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
      )
    );
    expect(markup).toContain('Grey seal');
    expect(markup).toContain('2025-10-06');
    expect(markup).toContain('Farne Islands');
    expect(markup).toContain('Latin name:');
    expect(markup).toContain('Halichoerus grypus');
    expect(markup).toContain('Reported by A. Diver (SOCS)');
  });
});
