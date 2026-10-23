<div align="center">

# Astra Studio

Build interactive 3D data dashboards with natural language.

**Vue 3 · Three.js · ECharts · MIT**

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [Deutsch](README.de.md)

[Open Studio](https://yinweinidongle.github.io/big-screen-astra/) · [AI Copilot](https://shanghai-city-observatory.brainy-pony-0848.chatgpt.site/?assistant=1) · [Header Studio](https://yinweinidongle.github.io/big-screen-astra/header-studio/)

</div>

![Six dashboard templates: city, agriculture, industry, campus, satellite map and China 3D vector map](docs/screenshots/overview.webp)

## One prompt. An editable dashboard.

![Actual Copilot workflow: prompt, scene generation, checks and automatic application](docs/screenshots/copilot-generate.gif)

**32 tools** for planning, layouts, charts, scenes and frontend code. Automatically create or refine, continue edits, check actual execution, resume interrupted work and undo each turn.

<sub>This real recording generated 15 components in 9.6 seconds using demo data. Timing varies by model and network.</sub>

<sub>Real interactions, edited to shorten waits and repetition.</sub>

<details>
<summary>Refine components</summary>

Update the title and number card while keeping the rest of the dashboard.

![Refine components](docs/screenshots/copilot-refine.gif)

</details>

<details>
<summary>Write and iterate on shaders</summary>

Add a custom GLSL energy ring to the existing scene.

![Write and iterate on shaders](docs/screenshots/copilot-shader.gif)

</details>

<details>
<summary>Switch scene materials</summary>

Graphite, amber alloy and blue glass. Positions and labels stay in place.

![Switch scene materials](docs/screenshots/copilot-materials.gif)

</details>


## Core capabilities

| Capability | Highlights |
| --- | --- |
| **Free canvas** | Drag, resize, select, group and snap. Collapse either sidebar or enter canvas focus mode. |
| **Visualization** | 30 components and 14 chart types. Flip counters, scrolling lists, glow, vignette and color matrices. |
| **3D editing** | Add GLB/glTF, buildings and equipment to existing scenes. Edit materials, shaders, animation and interactive POIs. |
| **Frontend coding** | Generate JS / HTML / CSS / GLSL. Actual compilation, runtime feedback, multiple files and source export. |
| **Header Studio** | 12 backgrounds and 15 flow effects. Draw SVG paths, mirror, trim intersections and export Vue components. |
| **Data and delivery** | JSON, HTTP, WebSocket, D1 SQL and linked interactions. Portable projects, snapshots and password / token sharing. |

<table>
<tr>
<td width="50%"><img src="docs/screenshots/scene-editor.webp" alt="Edit models, materials and annotations inside an existing scene" /></td>
<td width="50%"><img src="docs/screenshots/header-studio.webp" alt="Design backgrounds, SVG paths and typography together" /></td>
</tr>
<tr><td align="center">Scene Studio</td><td align="center">Header Studio</td></tr>
</table>

## Industry templates

[Smart City](https://yinweinidongle.github.io/big-screen-astra/templates/city/) · [Agriculture](https://yinweinidongle.github.io/big-screen-astra/templates/agriculture/) · [Industry](https://yinweinidongle.github.io/big-screen-astra/templates/industry/) · [Campus](https://yinweinidongle.github.io/big-screen-astra/templates/campus/) · [Satellite Map](https://yinweinidongle.github.io/big-screen-astra/templates/gis/) · [China 3D Vector Map](https://yinweinidongle.github.io/big-screen-astra/templates/regions/)

## Quick start

Node.js **22.12+**

```bash
git clone https://github.com/yinweinidongle/big-screen-astra.git
cd big-screen-astra
npm ci
npm run dev
```

Connect Copilot: copy `.dev.vars.example` to `.dev.vars`, then configure your model API key and encryption key. Supports OpenRouter, DeepSeek, Qwen, Kimi, OpenAI, Anthropic, Gemini and compatible endpoints.

[Development & deployment](docs/development.md) · [Code API](docs/frontend-code-agent.md) · [Agent architecture & audit](docs/agent-workflow-audit.md)

<sub>GitHub Pages runs the static editor. AI, cloud storage and protected sharing require the full service. The editor UI is currently in Chinese.</sub>

---

[MIT](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [Map data licenses](public/assets/maps/ATTRIBUTION.md)
