<div align="center">

# Astra Studio

用自然语言，构建可交互的 3D 数据大屏。

**Vue 3 · Three.js · ECharts · MIT**

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [Deutsch](README.de.md)

[在线设计](https://yinweinidongle.github.io/big-screen-astra/) · [智能创作](https://shanghai-city-observatory.brainy-pony-0848.chatgpt.site/?assistant=1) · [Header 设计器](https://yinweinidongle.github.io/big-screen-astra/header-studio/)

</div>

![城市、农业、工业与园区四套行业模板](docs/screenshots/overview.webp)

## 一句话，生成可编辑大屏

![智能体真实生成过程：输入需求、构建场景、检查并自动应用](docs/screenshots/copilot-generate.gif)

**32 项工具**完成规划、布局、图表、场景与前端代码创作。自动判断新建或优化，支持连续修改、运行检查、中断恢复和单轮撤销。

<sub>本次真实录制：9.6 秒生成 15 个组件，使用演示数据；耗时随模型和网络变化。</sub>

<sub>真实交互录制，剪去部分等待与重复画面。</sub>

<details>
<summary>组件增量修改</summary>

修改标题与数字卡片，保留其余组件。

![组件增量修改](docs/screenshots/copilot-refine.gif)

</details>

<details>
<summary>编写与迭代 Shader</summary>

在已有场景叠加自定义 GLSL 能量光环。

![编写与迭代 Shader](docs/screenshots/copilot-shader.gif)

</details>

<details>
<summary>场景材质切换</summary>

石墨金属、琥珀合金、冰蓝玻璃，位置与标签保持不变。

![场景材质切换](docs/screenshots/copilot-materials.gif)

</details>


## 核心能力

| 能力 | 亮点 |
| --- | --- |
| **自由画布** | 拖拽、缩放、多选、组合、吸附对齐；两侧面板独立收起，一键专注画布。 |
| **可视化组件** | 30 个组件、14 种图表；数字翻动、动态列表、辉光、暗角与色彩矩阵。 |
| **3D 场景编辑** | 在已有场景添加 GLB/glTF、设备与建筑；编辑材质、Shader、动画和交互 POI。 |
| **前端编程** | 智能体编写 JS / HTML / CSS / GLSL；真实编译、运行反馈、多文件与源码导出。 |
| **Header Studio** | 12 款背景、15 种光轨效果；绘制 SVG 路径、同步镜像、交点裁剪与 Vue 组件导出。 |
| **数据与交付** | JSON、HTTP、WebSocket、D1 SQL 与组件联动；项目包、快照、密码 / Token 分享。 |

<table>
<tr>
<td width="50%"><img src="docs/screenshots/scene-editor.webp" alt="已有场景内编辑模型、材质与标签" /></td>
<td width="50%"><img src="docs/screenshots/header-studio.webp" alt="Header 背景、SVG 光轨与文字一体化编辑" /></td>
</tr>
<tr><td align="center">Scene Studio</td><td align="center">Header Studio</td></tr>
</table>

## 行业模板

[智慧城市](https://yinweinidongle.github.io/big-screen-astra/templates/city/) · [智慧农业](https://yinweinidongle.github.io/big-screen-astra/templates/agriculture/) · [智慧工业](https://yinweinidongle.github.io/big-screen-astra/templates/industry/) · [智慧园区](https://yinweinidongle.github.io/big-screen-astra/templates/campus/)

## 快速启动

Node.js **22.12+**

```bash
git clone https://github.com/yinweinidongle/big-screen-astra.git
cd big-screen-astra
npm ci
npm run dev
```

接入智能体：复制 `.dev.vars.example` 为 `.dev.vars`，配置模型 API Key 和加密密钥。支持 OpenRouter、DeepSeek、通义千问、Kimi、OpenAI、Anthropic、Gemini 等兼容接口。

[开发与部署](docs/development.md) · [编程接口](docs/frontend-code-agent.md) · [智能体架构与审计](docs/agent-workflow-audit.md)

<sub>GitHub Pages 提供静态编辑；AI、云端与受保护分享使用完整服务。编辑器界面目前为中文。</sub>

---

[MIT](LICENSE) · [第三方声明](THIRD_PARTY_NOTICES.md) · [地图数据授权](public/assets/maps/ATTRIBUTION.md)
