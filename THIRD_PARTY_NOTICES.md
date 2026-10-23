# Third-party notices

The MIT license in `LICENSE` applies to this project's original code and documentation. Third-party software and services retain their own licenses and terms. The dependency versions are recorded in `package-lock.json`; their license files are distributed with the respective packages.

| Component | License / source |
| --- | --- |
| Vue, Vite, @vitejs/plugin-vue | MIT |
| Three.js and its bundled examples | MIT |
| Acorn JavaScript parser | MIT |
| SES / Endo hardened JavaScript runtime | Apache-2.0 |
| Lucide Vue icons | ISC |
| Apache ECharts | Apache-2.0 |
| Drizzle ORM | Apache-2.0 |
| Drizzle Kit | MIT |
| esbuild | MIT |
| Wrangler | MIT OR Apache-2.0 |
| Leaflet 1.9.4 | BSD-2-Clause; [license](public/assets/maps/leaflet-license.txt) |
| Administrative boundaries | geoBoundaries / original sources; [dataset attribution and separate data licenses](public/assets/maps/ATTRIBUTION.md) |
| Mapbox GL JS v3 | Mapbox license and service terms; see the installed package's LICENSE.txt and https://www.mapbox.com/legal/ |
| Natural Earth land geometry | Public domain; https://www.naturalearthdata.com/about/terms-of-use/ |
| Google Fonts, when loaded | Font-specific licenses apply; see each font's Google Fonts entry. System font fallbacks are provided. |

`public/assets/world-land.geojson` is derived from Natural Earth's 110m land geometry. Built-in city and industrial scene geometry is procedural concept geometry, not a surveying dataset.

Scene Studio includes CC0 assets from [Kenney Nature Kit](https://kenney.nl/assets/nature-kit), [Car Kit](https://kenney.nl/assets/car-kit), [Mini Characters](https://kenney.nl/assets/mini-characters), and [Poly Haven](https://polyhaven.com/license). Five selected GLB models are included with palette textures converted to vertex colors; geometry and animation are retained. Source licenses are in `public/assets/scene/models/licenses/`. Sky panoramas and surface maps are resized and encoded as WebP; sky lower hemispheres are mirrored for orbit views, and the rainy sky is darkened. These third-party assets retain CC0-1.0 rather than inheriting the project's MIT code license. The concrete texture is AI-generated project artwork. Exact asset sources, modifications and the generation prompt are recorded in [the asset manifest](public/assets/scene/sources.json).

Header and dashboard artwork in `public/assets` includes AI-generated visual assets. Generation prompts and contour-tracing notes are kept in `docs/header-generation.md`, `docs/demo-image-generation.md`, and `docs/studio-header-generation.json`. These assets are artistic illustrations, not factual imagery of operating facilities.

Mapbox access requires a user-supplied public token and remains subject to Mapbox's terms. The project does not bundle a Mapbox account or private credentials. An optional Draco decoder is loaded from Google's public decoder CDN when Draco support is enabled; the decoder has its own Apache-2.0 distribution license.

Leaflet satellite maps load Esri World Imagery tiles on demand. Street maps load OpenStreetMap tiles on demand; visible attribution is retained, and no bulk prefetch or offline tile downloads are implemented. Business monitoring markers and indicators are demonstration data, not verified operational observations. Administrative boundary datasets retain their separate licenses; the Japan derived boundary database is distributed under ODbL 1.0, not MIT.
