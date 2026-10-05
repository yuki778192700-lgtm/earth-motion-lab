# 第八步：教学场景性能优化

验证日期：2026-10-02。

## 实测对比

同一浏览器、默认地球自转场景、默认图层开启；通过开发环境 ScenePerformanceProbe 读取 Three.js 上一帧统计。

| 指标 | 优化前 | 优化后 |
| --- | ---: | ---: |
| 每帧绘制调用 | 62 | 30 |
| 场景对象数量（含 scene 根节点） | 89 | 57 |
| renderer.info.memory.geometries | 62 | 30 |
| 纹理数量 | 2 | 2 |
| 经纬网绘制对象 | 34 | 2 |

默认场景绘制调用减少 51.6%。这是提交次数对比，不代表帧率提高相同比例；未进行跨设备 FPS 测量。

## 实现

- CoordinateGrid 按纬线、经线各合并为一个 Drei LineSegments2，以 BufferGeometry 成对端点绘制；保留原采样点、半径、线宽、颜色、透明度和深度测试。
- pathsToLineSegments 明确区分不同路径，避免经纬线之间出现错误连接。
- EarthModel 在模拟时间和旋转模型未改变时跳过旋转角计算及赋值；首次挂载和日期拖动仍更新。
- 完整所选纬线只依赖纬度；昼夜弧仍在时间变化时精确更新。晨昏线、轨道、纬线已有 useMemo，保留其科学更新频率。
- CoordinateGrid、EarthAxis、GeographicReferenceLines、CloudLayer、AtmosphereLayer、固定太阳参考系和昼夜半球使用 React.memo，减少父级时间变化导致的无效重绘。
- 云层及大气的着色器、球面采样和透明效果保持原实现，没有降低画质。
- 保持 R3F 声明式几何/材质卸载回收，以及 Drei Line 自带的 dispose 清理。
- ScenePerformanceProbe 仅在开发构建中启用，每秒更新一次 canvas 数据属性，不添加可见界面或场景对象。

## 验证

- 95/95 单元测试通过，含合并路径端点与空路径边界测试。
- npm run build 与 git diff --check 通过；仍有原有主包超过 500 kB 的体积提示。
- 经纬网开关三轮：关闭均为 28 次绘制 / 28 个几何；开启均为 30 次绘制 / 30 个几何，无累积增长。
- 页面暂停前后模拟时间一致。
- 昼夜侧视和公转场景检查通过，浏览器 error 日志为空。
- 现有自转方向、太阳参考系、晨昏线、昼夜计算和倍率测试均随完整测试通过。

## 本步文件

- src/lib/lineSegments.ts
- src/lib/lineSegments.test.ts
- src/components/scene/CoordinateGrid.tsx
- src/components/scene/EarthModel.tsx
- src/components/scene/EarthAxis.tsx
- src/components/scene/GeographicReferenceLines.tsx
- src/components/scene/ScenePerformanceProbe.tsx
- src/components/scene/EarthCanvas.tsx
- src/components/day-night/LatitudeDayNightArcs.tsx
- src/components/day-night/DayNightSunlight.tsx
- src/components/day-night/IlluminationHemispheres.tsx
- src/components/systems/earth/CloudLayer.tsx
- src/components/systems/earth/AtmosphereLayer.tsx

后续可单独评估动态线段缓冲区复用、云层 GPU 时间和代码分包；本阶段没有以降低天文精度或外观质量换取性能。
