<div align="center">

# Astra Studio

### Turn data into a space you can explore.

Visual dashboard studio · Three.js digital twins · SVG header designer

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

[Live demo](https://yinweinidongle.github.io/big-screen-astra/) · [Templates](https://yinweinidongle.github.io/big-screen-astra/templates/city/) · [Header Studio](https://yinweinidongle.github.io/big-screen-astra/header-studio/) · [Full service](https://shanghai-city-observatory.brainy-pony-0848.chatgpt.site/)

![MIT](https://img.shields.io/badge/license-MIT-8fb6ff) ![Vue 3](https://img.shields.io/badge/Vue-3-42b883) ![Three.js](https://img.shields.io/badge/Three.js-WebGL-101827) ![Node](https://img.shields.io/badge/Node-%E2%89%A522.12-5c9e56)

![Actual screenshots of the four industry templates](docs/screenshots/overview.webp)

</div>

Astra Studio brings a freeform canvas, data visualization, interactive 3D scenes and animated header design into one workspace. Start with a template, then configure each component's layout, style, data and interactions. All included business values are demonstration data. These documents are available in three languages; the editor currently uses a Chinese interface.

## Four distinct templates

Each template has its own layout, panels, charts and scene composition.

| Template | Visual direction and 3D details | Demo |
| --- | --- | --- |
| City operations | Cool blue command deck; 342 instanced buildings, Shanghai landmarks, bridges, waterfront paths and traffic | [City](https://yinweinidongle.github.io/big-screen-astra/templates/city/) |
| Precision agriculture | Emerald and warm gold; greenhouses, 1,134 plants, orchards, irrigation filters and a drone | [Agriculture](https://yinweinidongle.github.io/big-screen-astra/templates/agriculture/) |
| Smart manufacturing | Graphite and amber; cutaway factory, robot arms, AGVs, conveyors, pipes and maintenance walkways | [Industry](https://yinweinidongle.github.io/big-screen-astra/templates/industry/) |
| Connected campus | Violet and silver glass; curtain walls, skybridges, rooftop solar, EV chargers and a fountain | [Campus](https://yinweinidongle.github.io/big-screen-astra/templates/campus/) |

## Design workspace

![Actual Astra Studio editor](docs/screenshots/workbench.webp)

- **Freeform layout:** drag, resize in eight directions, multi-select, group, reorder, lock, snap, align and distribute. Fit, cover, width-fit and stretch display modes.
- **Visual controls:** 29 components, 14 chart types, six themes, six backgrounds and eight border styles. Rolling numbers, scrolling lists, gradients, glow, vignette and color matrices.
- **Spatial components:** Three.js scenes and globe, GLB/glTF loading, materials, animation, FlyTo, orbit, model picking and POI cards. Mapbox buildings and DEM terrain require your own public token.
- **Data and interactions:** static JSON, HTTP, WebSocket, field mapping, refresh intervals, click/hover events, filtering and drill-down. SQL uses restricted D1 queries in the Worker; connect other databases through your own HTTP gateway.
- **Portable projects:** IndexedDB storage, undo/redo and local snapshots. Import/export JSON or `.astra.zip` packages containing project assets.

## Header Studio

![Actual Header Studio editor](docs/screenshots/header-studio.webp)

Choose from 12 backgrounds with calibrated SVG paths, upload artwork, draw polylines or curves, move nodes and titles, mirror paths in sync and automatically trim excess segments at intersections.

Fifteen effects cover comets, fading trails, ghosts, moving dots, particles, beads, pulses, signal codes, scans, converging flows, ripples, spectra, arcs, breathing light and static outlines. Adjust color, speed, direction, width and glow.

Export a standalone Vue single-file component or a ZIP with the component, image and JSON configuration. Exported components require Vue 3.5+. Shortcuts: `P` polyline, `B` curve, `Enter` finish, `V` select, `Space` pause, `Ctrl/⌘ Z` undo.

## Run locally

Requires **Node.js 22.12+** and npm.

```bash
git clone https://github.com/yinweinidongle/big-screen-astra.git
cd big-screen-astra
npm ci
npm run dev
```

The dev command applies local D1 migrations and starts Vite on `:5173` and the Worker on `:8787`. A development identity is enabled only for this local workflow.

```bash
npm test                 # Editor, scenes, real D1/R2, headers and trimming
npm run build            # Frontend + Worker
npm run preview          # Preview the full build locally
npm run build:pages      # Static output in dist/pages
npm run preview:pages    # Preview the Pages build
```

## Deployment options

| Capability | GitHub Pages | Worker + D1 + R2 |
| --- | :---: | :---: |
| Templates, 3D scenes, header editing and component export | ✓ | ✓ |
| Local projects, assets, snapshots and project packages | ✓ | ✓ |
| Direct browser HTTP / WebSocket connections | Upstream must permit CORS / connections | ✓ |
| Account-scoped cloud projects and assets | — | ✓ |
| D1 SQL, publication snapshots, password / token sharing | — | ✓ |

**GitHub Pages:** `.github/workflows/pages.yml` validates, builds and deploys pushes to `master` or `main`. Select **GitHub Actions** under Settings → Pages → Source. The workflow derives the base path from the repository name; the local default is `/big-screen-astra/`. Override it with `PAGES_BASE_PATH=/my-repo/ npm run build:pages`. Physical HTML entry points support direct nested links and refreshes. See the [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

**Full service:** `npm run build` produces `dist/client` and `dist/server`. Configure Worker bindings `ASSETS`, D1 `DB` and R2 `BUCKET`, then apply `drizzle/` migrations. Cloud writes use a trusted identity supplied by Sites; another host requires adapting server authentication. Never enable `LOCAL_DEV` in production. Protected sharing requires server-side verification and is unavailable on static hosting.

## Routes

Routes below are relative to the deployment base path.

| Path | Page |
| --- | --- |
| `/`, `/studio/` | Visual editor |
| `/templates/city/`, `/templates/agriculture/`, `/templates/industry/`, `/templates/campus/` | Editable industry template previews |
| `/header-studio/` | Header designer |
| `/city/`, `/demo01/`, `/demo02/`, `/demo03/` | Original standalone city, agriculture, industry and campus dashboards |
| `/player/` | Local project player |
| `/view/:slug` | Server-published dashboard; full service required |

## Performance and source layout

Building and vegetation instancing, merged static geometry, lazy chunks, cached shadows and adaptive DPR keep rendering costs bounded. Offscreen or hidden scenes stop drawing; paused scenes render on demand. GPU resources are released on unmount. Quality presets cap rendering at 30 / 30 / 60fps and DPR at 1× / 1.5× / 2×. Actual performance depends on hardware, resolution and browser.

```text
src/workbench/          Canvas, schema, widgets, data adapters and detailed 3D scenes
src/studio/             Header editor, SVG paths, presets and Vue/ZIP export
src/demos/              Original standalone dashboards
src/paths.js            Domain-root and Pages-subpath URL handling
server/                 Identity, permissions, projects, publishing, SQL and assets
db/ · drizzle/          D1 declarations and migrations
scripts/                Development, builds, geometry and integration checks
docs/screenshots/       Screenshots from the running application
```

## Contributing and license

Issues and pull requests are welcome. Run `npm test` and `npm run build:pages` before submitting. For scene changes, check animation, pause, POIs and rendering cost in all four templates.

Original project code is released under the [MIT License](LICENSE). Dependencies, fonts, map services and public-domain geographic data retain their respective terms; see [third-party notices](THIRD_PARTY_NOTICES.md). Artwork includes AI-generated assets with prompts in `docs/`. Procedural scenes and demo data do not represent surveying data or live equipment operations.
