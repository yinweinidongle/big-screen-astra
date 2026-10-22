# Third-party notices

The MIT license in `LICENSE` applies to this project's original code and documentation. Third-party software and services retain their own licenses and terms. The dependency versions are recorded in `package-lock.json`; their license files are distributed with the respective packages.

| Component | License / source |
| --- | --- |
| Vue, Vite, @vitejs/plugin-vue | MIT |
| Three.js and its bundled examples | MIT |
| Lucide Vue icons | ISC |
| Apache ECharts | Apache-2.0 |
| Drizzle ORM | Apache-2.0 |
| Drizzle Kit | MIT |
| esbuild | MIT |
| Wrangler | MIT OR Apache-2.0 |
| Mapbox GL JS v3 | Mapbox license and service terms; see the installed package's LICENSE.txt and https://www.mapbox.com/legal/ |
| Natural Earth land geometry | Public domain; https://www.naturalearthdata.com/about/terms-of-use/ |
| Google Fonts, when loaded | Font-specific licenses apply; see each font's Google Fonts entry. System font fallbacks are provided. |

`public/assets/world-land.geojson` is derived from Natural Earth's 110m land geometry. Model and scene geometry elsewhere is procedural concept geometry, not a surveying dataset.

Header and dashboard artwork in `public/assets` includes AI-generated visual assets. Generation prompts and contour-tracing notes are kept in `docs/header-generation.md`, `docs/demo-image-generation.md`, and `docs/studio-header-generation.json`. These assets are artistic illustrations, not factual imagery of operating facilities.

Mapbox access requires a user-supplied public token and remains subject to Mapbox's terms. The project does not bundle a Mapbox account or private credentials. An optional Draco decoder is loaded from Google's public decoder CDN when Draco support is enabled; the decoder has its own Apache-2.0 distribution license.
