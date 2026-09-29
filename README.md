# Cardoo

Lightweight, Hebrew-first RTL landing page prototype for Cardoo. Built with semantic HTML, CSS, and vanilla JavaScript.

## Preview

Open `index.html` directly in a browser or serve this directory with a static server (for example `python3 -m http.server 8000`). The catalog data is a local JavaScript file, so the page also works from a `file://` URL without a JSON fetch.

## Project structure

- `index.html` — page content and semantic structure
- `accessibility.html` — Cardoo accessibility statement content page
- `privacy.html` — Cardoo privacy policy content page
- `css/styles.css` — responsive design system and components
- `js/app.js` — navigation, mobile drawer, and lead form behavior
- `js/catalog.js` — vehicle loading, filtering, and card rendering
- `js/hero-carousel.js` — background transitions, controls, and on-demand image loading
- `js/legal.js` — mobile navigation for the content pages
- `data/cars.js` — central prototype vehicle catalog, usable from `file://` and web servers
- `assets/images/` — Cardoo logo, optimized hero carousel images, and replaceable image assets

## Prototype notes

Vehicle images and payment amounts are illustrative placeholders. Confirm vehicle availability, financing terms, privacy copy, and contact details before publishing. The lead form uses a mock submission and does not send personal information to a server.
