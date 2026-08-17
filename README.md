# 地脉道 · 六十四卦（PWA）

离线可用的六十四卦查询 PWA。原生 HTML/CSS/JS + Service Worker，全部 64 卦数据内联于 `index.html`。

## 开发

- `validate.js`：校验 `index.html` 内联的 64 卦数据完整性（字段、序号、卦象字形、爻辞格式等）。
  ```bash
  node validate.js
  ```
- `tools/gen_icons.js`：用 Node 重新生成图标（乾卦六爻金线图，无需第三方依赖）。
  ```bash
  node tools/gen_icons.js
  ```

## 部署（GitHub Pages）

本项目通过 GitHub Pages 托管；手机用浏览器打开网址后「添加到主屏幕」即成为 App。

1. 仓库 **Settings → Pages**
2. **Build and deployment → Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，目录选择 `/ (root)` → 点击 **Save**
4. 约 1 分钟后网址为：`https://RLiu-2024.github.io/dimai-dao-pwa/`

> 开启后，每次 push 到 `main` 都会自动重新部署，无需手动操作。

## 更新

1. 修改代码并提交、推送：
   ```bash
   git push origin main
   ```
2. GitHub Pages 自动重新部署。
3. 手机端打开 App 时若检测到新版本，底部会弹出金色提示条
   **「發現新版本，點擊重新整理」**，点击一下即更新到最新版。
   （Service Worker 已改为「先提示、再套用」，不会悄悄替换你正在看的内容。）

如果提示条迟迟不出现，可在手机浏览器中对该网址执行「清除存储 / 删除数据」后再重新打开。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 应用主体（64 卦数据、UI、SW 注册与更新提示条） |
| `sw.js` | Service Worker（app shell 网络优先、静态资源缓存优先） |
| `manifest.webmanifest` | PWA 清单 |
| `icon-192.png` / `icon-512.png` / `icon-maskable-512.png` / `apple-touch-icon.png` | 图标 |
| `validate.js` | 数据完整性校验（CI 也会执行） |
| `.github/workflows/validate.yml` | 每次 push 自动校验数据 |
| `tools/gen_icons.js` | 图标生成脚本 |

## 数据约定

- 每条卦象含 `composition`（中文上下卦，如 `乾上乾下`）与 `pinyin`（罗马拼音，如 `Qián shàng Qián xià`）两个字段。
- 搜索支持卦名、中文结构与罗马拼音（如输入 `qian` 可搜到乾卦）。
