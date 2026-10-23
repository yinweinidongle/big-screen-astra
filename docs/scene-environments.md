# 场景环境与交互标签

选中已有 3D 组件，点击工具栏「场景编辑」。修改直接作用于当前组件，原有场景、图表和大屏布局保留。

- **环境**：透明背景、晴天、阴天、雨天；可调天空亮度、朝向、柔化、雾感和雨幕密度。天空参与场景反射，切换环境不重建基础场景。
- **地面**：在「环境」中选择水泥地、草地、瓷砖或木地板，添加可独立移动、缩放、复制的地面对象。右侧可调整贴图、横纵重复与旋转方向。
- **模型**：模型素材库包含远山地形、岩石、草丛、工作人员、轿车和货车。人物和车辆采用本地自包含 GLB，运行时无需访问素材外站。
- **材质**：14 种预设，包括动态水面、墙面、地面、玻璃和金属。切换与调参保留几何体；「原始材质」恢复模型自身外观。
- **标签与面板**：交互预览中，选中标签有描边并连接对应信息面板。连接线跟随视角与画布缩放；标签避开面板，目标离开画面时连线隐藏。面板关闭后连线同步移除。
- **保存与撤销**：环境、模型、材质与镜头均参与场景撤销/重做。点击「应用并返回」后随项目保存，并包含在项目配置导出中。

## 智能体接口

`get_scene_state` 提供天空、纹理、材质与模型预设。`update_widgets.props.sceneEnvironment` 按字段增量合并；`add_scene_objects` 添加 `ground` / `mountains` 或 `modelPreset`；`update_scene_objects` 调整指定对象。

```js
// update_widgets 的 props 示例
{ sceneEnvironment: { sky: 'rainy', brightness: 0.8, rain: 0.5 } }

// add_scene_objects 的 objects 示例
[
  { preset: 'ground', position: [0, -0.02, 0],
    material: { preset: 'tile', textureRepeat: [16, 16], textureRotation: 0 } },
  { kind: 'model', modelPreset: 'car', position: [-14, 0, 18] }
]
```

`inspect_runtime` 读取实际天空加载状态、附加对象加载状态与材质颜色；加载失败或纹理未就绪会阻止检查通过。

## 性能与素材

纹理按需加载，重复材质共享资源；天空和贴图在场景内缓存，退出时释放。远山采用合批几何体，雨幕仅一次绘制并由 GPU 更新；水面使用现有标准光照材质上的法线动效。GLB 有多条动作时优先播放待机动作，避免所有动作叠加。

免费模型来自 [Kenney](https://kenney.nl/assets)，天空及其他表面贴图来自 [Poly Haven](https://polyhaven.com/license)，均为 CC0。模型保留几何体和动画，调色板贴图转换为顶点色，消除外部贴图依赖。原始许可证随素材保存。

水泥贴图通过内置 **image_gen** 工具生成，保存为 [`public/assets/scene/textures/concrete.webp`](../public/assets/scene/textures/concrete.webp)。完整生成提示词及每个素材的来源、下载地址、处理说明见 [`sources.json`](../public/assets/scene/sources.json)。

验证：`npm test` 包含环境异步切换与取消、重试、资源释放、雨幕预算、材质共享、连线端点、智能体增量编辑及项目导出回读；实际界面另验证天空、地面、模型、材质、面板和撤销操作。
