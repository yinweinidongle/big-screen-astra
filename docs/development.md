# Development & deployment

## Local development

Requires Node.js 22.12+ and npm.

```bash
npm ci
npm run dev
```

The development script applies local D1 migrations and starts Vite at `:5173` and the Worker at `:8787`. The simulated development identity is local-only.

```bash
npm test
npm run build
npm run preview
npm run build:pages
npm run preview:pages
```

## Model configuration

Copy `.dev.vars.example` to `.dev.vars` and configure:

- `AGENT_DEFAULT_API_KEY`: the default OpenRouter key.
- `AGENT_DEFAULT_MODEL`: default model ID.
- `AGENT_ENCRYPTION_KEY`: a stable 64-character hexadecimal encryption key.

Personal provider profiles can be added through the Copilot **模型** tab. Keys are encrypted with AES-GCM in D1 and scoped to the signed-in account. Changing the provider host requires a new key. Changing the encryption key requires re-saving personal provider keys. Do not put credentials in `VITE_*` variables.

Production uses runtime secrets and `AGENT_DEFAULT_OWNER_ID` or `AGENT_DEFAULT_OWNER_EMAIL` to restrict the shared default. Never enable `LOCAL_DEV` in production.

## Hosting

| Capability | GitHub Pages | Worker + D1 + R2 |
| --- | :---: | :---: |
| Canvas, templates, 3D scenes, Header Studio, code editor | ✓ | ✓ |
| Local projects, assets, snapshots and exports | ✓ | ✓ |
| Browser HTTP / WebSocket sources | Upstream must allow access | ✓ |
| AI Copilot, account-scoped cloud projects and assets | — | ✓ |
| D1 SQL, publication history, password / token sharing | — | ✓ |

### GitHub Pages

`.github/workflows/pages.yml` tests, builds and deploys on pushes to `master` / `main`. Select **GitHub Actions** in Settings → Pages. The workflow sets the repository base path automatically.

For a custom path:

```bash
PAGES_BASE_PATH=/my-repo/ npm run build:pages
```

The Pages editor can transfer the current project, prompt and local assets to the full service through an origin-checked window bridge. Transfer does not automatically start a model call.

### Full service

`npm run build` produces `dist/client` and `dist/server`. Bind `ASSETS`, D1 `DB` and R2 `BUCKET`, then apply the migrations in `drizzle/`. Trusted identity is supplied by Sites; another host requires an adapted identity integration.

SQL uses scoped, restricted D1 queries. External databases can be connected through an HTTP gateway. Mapbox requires a public `pk` token supplied by the user.

## Routes

| Path | View |
| --- | --- |
| `/`, `/studio/` | Dashboard editor |
| `/templates/city/`, `/templates/agriculture/`, `/templates/industry/`, `/templates/campus/` | Industry previews |
| `/header-studio/` | Header Studio |
| `/city/`, `/demo01/`, `/demo02/`, `/demo03/` | Original standalone dashboards |
| `/player/` | Local project player |
| `/view/:slug` | Published dashboard; requires backend |

## Contributing

Run `npm test` and `npm run build:pages` before a pull request. For scene changes, check all four templates, pause behavior, POIs and rendering cost.

See [frontend code APIs](frontend-code-agent.md), the [agent audit](agent-workflow-audit.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).
