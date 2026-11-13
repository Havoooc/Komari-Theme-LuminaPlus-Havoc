# Komari-Theme-LuminaPlus-Havoc

基于 [shanyang242/Komari-Theme-LuminaPlus](https://github.com/shanyang242/Komari-Theme-LuminaPlus) `v1.3.6` 的独立维护定制版，已将主题标识（`short: "LuminaPlus-Havoc"`）与上游仓库隔离，避免 Komari 后台主题市场升级时被直接覆盖。

## 定制内容

- **独立主题标识**：`komari-theme.json` 中 `short` 改为 `LuminaPlus-Havoc`，`url` 指向本仓库。
- **首页双列概览**：在 `dist/index.html` 中隐藏首页概览的「资产概览」与「累计流量」卡片，并将 `.home-overview` 调整为双列布局（不影响 `/traffic` 与资产统计页）。
- **VPS 类型徽章**：在 `dist/assets/index-BX6_Q0cK.js` 与 `dist/index.html` 样式中为节点卡片价格旁增加「建站机 / 落地机 / 线路机」语义胶囊。
- **IPv4 三网去回程模块**：新增 `dist/assets/komari-routes.js` 与 `dist/assets/komari-routes.css`，对接同域 `/routes/api` 展示各节点电信 / 联通 / 移动去回程线路与状态提示。

## 安装说明

- 将 `komari-theme.json`、`preview.png` 与 `dist/` 置于 Komari 的 `./data/theme/LuminaPlus-Havoc/` 目录，或在 Komari 后台上传 Release 压缩包启用。
- 三网去回程模块需配合面板反向代理 `/routes/api` 暴露的后端路由服务使用；未部署该接口时不影响主题其余功能渲染。
