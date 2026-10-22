<div align="center">

# Astra Studio

### 把数据，变成可以探索的空间。

Vue 3 可视化大屏工作台 · Three.js 数字孪生 · SVG Header 设计器

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

[在线体验](https://yinweinidongle.github.io/big-screen-astra/) · [行业模板](https://yinweinidongle.github.io/big-screen-astra/templates/city/) · [Header Studio](https://yinweinidongle.github.io/big-screen-astra/header-studio/) · [完整服务版](https://shanghai-city-observatory.brainy-pony-0848.chatgpt.site/)

![MIT](https://img.shields.io/badge/license-MIT-8fb6ff) ![Vue 3](https://img.shields.io/badge/Vue-3-42b883) ![Three.js](https://img.shields.io/badge/Three.js-WebGL-101827) ![Node](https://img.shields.io/badge/Node-%E2%89%A522.12-5c9e56)

![四套行业模板的实际画面](docs/screenshots/overview.webp)

</div>

Astra Studio 将自由画布、数据图表、真实 3D 场景和科技感标题编辑放在同一个工作空间。选择模板即可预览；每个组件的布局、样式、数据和交互都可以继续调整。所有内置业务数据均为演示数据。README 提供三语版本，编辑器当前为中文界面。

## 从模板开始

四套模板使用不同的布局、面板、图表和场景语言，而非简单换色。

| 模板 | 视觉与场景 | 体验 |
| --- | --- | --- |
| 城市运行 | 冷蓝指挥舱；342 栋实例化建筑、陆家嘴地标、桥梁、滨水步道与车流 | [城市](https://yinweinidongle.github.io/big-screen-astra/templates/city/) |
| 精准农业 | 翡翠与暖金；温室、1,134 株作物、果树、灌溉过滤系统与无人机 | [农业](https://yinweinidongle.github.io/big-screen-astra/templates/agriculture/) |
| 工业智造 | 石墨与琥珀；开放车间、机械臂、AGV、输送线、管线与检修走道 | [工业](https://yinweinidongle.github.io/big-screen-astra/templates/industry/) |
| 未来园区 | 紫银玻璃；幕墙楼宇、空中连廊、屋顶光伏、充电设施与喷泉 | [园区](https://yinweinidongle.github.io/big-screen-astra/templates/campus/) |

## 创作工作台

![Astra Studio 工作台实际截图](docs/screenshots/workbench.webp)

- **自由布局**：拖拽、八向缩放、多选、组合、层级、锁定、智能吸附、对齐与等间距排列；适应、铺满、宽度自适应和拉伸模式。
- **完整视觉配置**：29 个组件、14 种图表、6 种主题、6 种背景、8 种边框；数字翻动、滚动列表、渐变、辉光、暗角与色彩矩阵。
- **空间组件**：Three.js 场景、智慧地球、GLB/glTF 模型、材质与动画、FlyTo、自动巡航、模型拾取及 POI 看板；Mapbox 支持建筑与 DEM 地形，需自行提供公开 Token。
- **数据与联动**：静态 JSON、HTTP、WebSocket、字段映射、刷新周期、点击与悬浮事件、筛选和下钻。SQL 使用 Worker 中的受限 D1 查询；外部数据库通过自己的 HTTP 网关接入。
- **可迁移项目**：IndexedDB 本机保存、撤销重做、历史快照；JSON 和包含素材的 `.astra.zip` 导入导出。

## Header Studio

![Header Studio 实际截图](docs/screenshots/header-studio.webp)

12 款背景预设搭配经过校准的 SVG 光轨，可上传背景、绘制折线与曲线、拖动节点与标题、同步镜像，并自动裁剪交点后的多余线段。

15 种效果包括彗星、渐隐拖尾、幻影、巡航光点、粒子、串珠、脉冲、信号编码、扫描、双向汇流、涟漪、光谱、电弧、呼吸与静态轮廓。颜色、速度、方向、粗细和光晕均可配置。

导出独立 Vue 单文件组件，或下载包含组件、图片和 JSON 的 ZIP。组件只依赖 Vue 3.5+。`P` 绘制折线，`B` 绘制曲线，`Enter` 完成，`V` 选择，`Space` 暂停，`Ctrl/⌘ Z` 撤销。

## 本地启动

需要 **Node.js 22.12+** 和 npm。

```bash
git clone https://github.com/yinweinidongle/big-screen-astra.git
cd big-screen-astra
npm ci
npm run dev
```

`npm run dev` 自动应用本地 D1 迁移，并启动 Vite `:5173` 和 Worker `:8787`。仅本机开发启用模拟开发账号。

```bash
npm test                 # 工作台、场景、真实 D1/R2、Header 与裁剪检查
npm run build            # 完整前端 + Worker 构建
npm run preview          # 本地预览完整构建
npm run build:pages      # 生成 dist/pages 静态站点
npm run preview:pages    # 预览 Pages 构建
```

## 两种部署方式

| 能力 | GitHub Pages | Worker + D1 + R2 |
| --- | :---: | :---: |
| 行业模板、3D 场景、Header 编辑与组件导出 | ✓ | ✓ |
| 本机项目、素材、快照与项目包 | ✓ | ✓ |
| 浏览器直连 HTTP / WebSocket | 需上游允许 CORS / 连接 | ✓ |
| 账号隔离的云端项目与素材 | — | ✓ |
| D1 SQL、发布快照、密码 / Token 分享 | — | ✓ |

**GitHub Pages**：`.github/workflows/pages.yml` 在推送到 `master` / `main` 后运行检查、构建并部署。仓库 Settings → Pages 的 Source 选择 **GitHub Actions**。默认子路径为 `/big-screen-astra/`，工作流根据仓库名设置；自定义构建可用 `PAGES_BASE_PATH=/my-repo/ npm run build:pages`。页面具有独立 HTML 入口，支持嵌套路径直接访问和刷新。参考 [Vite 部署说明](https://vite.dev/guide/static-deploy.html#github-pages)。

**完整服务**：`npm run build` 输出 `dist/client` 和 `dist/server`。Worker 需要 `ASSETS`、D1 `DB`、R2 `BUCKET` 绑定，并应用 `drizzle/` 迁移。云端写入使用 Sites 提供的可信身份；移植到其他宿主时需要适配服务端身份验证。不要在生产启用 `LOCAL_DEV`。受保护分享由服务端验证，纯静态站点不能替代该后端。

## 页面入口

以下路径相对于部署基础路径：

| 路径 | 页面 |
| --- | --- |
| `/`、`/studio/` | 可视化工作台 |
| `/templates/city/`、`/templates/agriculture/`、`/templates/industry/`、`/templates/campus/` | 四套可编辑行业模板预览 |
| `/header-studio/` | Header 设计器 |
| `/city/`、`/demo01/`、`/demo02/`、`/demo03/` | 保留的独立城市、农业、工业与园区大屏 |
| `/player/` | 本机项目播放器 |
| `/view/:slug` | 后端发布的大屏，需要完整服务 |

## 性能与项目结构

采用建筑与植被实例化、静态几何合批、按需分包、缓存阴影、自适应 DPR；隐藏页面或离开视野时停止绘制，暂停时按需渲染，卸载时释放 GPU 资源。三档画质分别提供最高 30 / 30 / 60fps 和 1× / 1.5× / 2× DPR 上限，实际表现取决于设备、分辨率与浏览器。

```text
src/workbench/          画布、配置 schema、组件、数据连接与详细 3D 场景
src/studio/             Header 编辑器、SVG 光轨、预设与 Vue/ZIP 导出
src/demos/              保留的独立行业大屏
src/paths.js            域名根路径与 Pages 子路径适配
server/                 身份、授权、项目、发布、SQL 与素材服务
db/ · drizzle/          D1 数据声明与迁移
scripts/                开发、构建、几何与集成检查
docs/screenshots/       实际运行截图
```

## 贡献与许可证

欢迎通过 Issue 报告问题，或提交 Pull Request。提交前运行 `npm test` 和 `npm run build:pages`；修改场景时请检查四套模板的动效、暂停、POI 与渲染开销。

项目原创代码以 [MIT License](LICENSE) 开源。依赖包、字体、地图服务与公共领域地理数据的说明见 [第三方声明](THIRD_PARTY_NOTICES.md)。背景素材包含 AI 生成的艺术设计，提示词保存在 `docs/`。程序化模型与演示数据不代表真实地理测绘或设备运行情况。
