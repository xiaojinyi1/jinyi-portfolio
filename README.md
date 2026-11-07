# JINYI — Selected Works

五件作品，一块广告牌。一个夜间 Drive-in 风格的个人作品集：单块 3D 广告牌轮流放映作品，点进去是独立案例页。

- **无构建步骤**：不需要 npm，也没有 CDN、外部字体或远程图片；Three.js 0.160 以本地 `assets/vendor/three.min.js` 引入。
- **可直接打开**：双击 `index.html` 就能浏览；也可以放到任意静态托管。
- **5 个作品**：一句话一座城、小鲸鱼快跑、Packet Orb、校园二手书交易平台、拾错。
- **5 个独立详情页**：`work/*.html`，共享 `assets/detail.js`，前后作品循环导航。

> 视觉语言参考 [bruno-simon.com](https://bruno-simon.com/) 的 PROJECTS 区域：夜间场地、低多边形剪影、金属广告牌、跑马灯泡、电影式换片。没有复制它的代码或资产；海报与广告牌是原创 CSS/SVG，场景中的地面、车、路灯和尘埃是 Three.js 程序化几何。

---

## 1. 怎么打开

### 直接打开（推荐）

在 Windows 资源管理器里双击 `index.html`。

站点使用 classic `<script>`（不是 ES module），因此 `file://` 下也能运行；`?work=slug` 深链同样可用。

### 本地静态服务器（可选）

如果本机有 Python：

```bash
cd 作品集
python -m http.server 4173
# http://127.0.0.1:4173/
```

或者本机有 Node：

```bash
cd 作品集
npx serve .
```

没有服务器也能打开；使用 `file://` 时，浏览器可能限制 `history.replaceState`，代码已经做了 try/catch，深链初始化不受影响。

### 部署到 GitHub Pages

目标仓库：`https://github.com/xiaojinyi1/jinyi-portfolio`  
目标站点：`https://xiaojinyi1.github.io/jinyi-portfolio/`

1. 在 GitHub 新建一个空仓库 `jinyi-portfolio`（不要勾选 README / .gitignore）。
2. 也可以直接在 Git Bash 运行仓库内的一键脚本（脚本会用已保存的 GitHub 凭据创建仓库、推送并尝试启用 Pages）：

   ```bash
   bash deploy-github.sh
   ```

3. 手动部署则在本目录执行：

   ```bash
   git init
   git add .
   git commit -m "feat: Three.js billboard portfolio"
   git branch -M main
   git remote add origin https://github.com/xiaojinyi1/jinyi-portfolio.git
   git push -u origin main
   ```

4. 仓库里的 `.github/workflows/pages.yml` 会自动部署；首次运行时 `actions/configure-pages@v5` 的 `enablement: true` 会尝试启用 Pages。
5. 打开 `Settings → Pages`，确认 Source 是 **GitHub Actions**；Actions 的 `deploy` job 变绿后访问上面的站点地址。
6. 以后更新只需 `git add . && git commit -m "..." && git push`，Pages 会重新发布。

如果 Actions 的 `configure-pages` 因仓库权限无法自动启用 Pages：在 `Settings → Pages` 手动把 Source 设为 **Deploy from a branch**，分支选 `main`、目录选 `/ (root)`，再重新运行 workflow。

> 站点全部使用相对路径，放在 `https://<user>.github.io/<repo>/` 子路径下也能工作。Vercel / Netlify 也可以直接上传整个目录。

---

## 2. 作品与路由

| # | 作品 | 类型 | 详情页 | 线上 / 源码 |
| --- | --- | --- | --- | --- |
| 01 | 一句话，一座城 | 生成式 3D / 互动叙事 | `work/one-sentence-one-city.html` | [Live](https://xiaojinyi1.github.io/one-sentence-one-city/) / [Source](https://github.com/xiaojinyi1/one-sentence-one-city) |
| 02 | 小鲸鱼快跑 | 游戏 / Canvas 2D | `work/little-whale-run.html` | [Live](https://little-whale-run.vercel.app) / [Source](https://github.com/xiaojinyi1/little-whale-run) |
| 03 | Packet Orb | 实验性 3D / 数据可视化 | `work/packet-orb.html` | [Live](https://xiaojinyi1.github.io/-packet-orb/) / [Source](https://github.com/xiaojinyi1/-packet-orb) |
| 04 | 校园二手书交易平台 | 全栈教学示例 / PostgreSQL | `work/campus-book-market.html` | 课程项目 · 未公开部署 |
| 05 | 拾错 | 全栈产品 / 数据库设计 | `work/shicuo.html` | [Live](https://xiaojinyi1.github.io/shicuo/) / [Source](https://github.com/xiaojinyi1/shicuo) |

### 导航逻辑

- 主页点击广告牌屏幕 → 当前作品详情页（`settings.clickScreen` 默认 `"open"`）。
- 主页底部编号、左右箭头、拖拽、滚轮、键盘 ←/→、Home/End、数字 1–5 都只切换广告牌，不跳页。
- 详情页左上角 `BACK TO BILLBOARD` 返回 `index.html?work=<slug>`，回来时仍停在同一个作品。
- 详情页底部 `NEXT CASE` 按 01→02→03→04→05→01 循环；每个详情页都有上一页/下一页的语义位置。
- 深链：`index.html?work=shicuo` 直接打开第 05 个作品；详情页返回链接也使用这个参数。

---

## 3. 交互方式

| 输入 | 行为 |
| --- | --- |
| 鼠标悬停广告牌 | 出现 `OPEN CASE` 指针标签；广告牌保持可点击状态 |
| 点击屏幕 / 广告牌 | 打开当前作品详情页 |
| 点击左右箭头 / 底部编号 | 上一件 / 下一件 / 跳到指定作品 |
| 拖拽屏幕（水平） | 超过 38px 切换作品；拖拽后不会误触打开详情 |
| 鼠标滚轮 | 在舞台区域上下滚动切换作品（约 520ms 节流） |
| 键盘 ← → / ↑ ↓ | 上一件 / 下一件 |
| 键盘 Home / End | 第一件 / 最后一件 |
| 键盘 1–5 | 直接跳到对应作品 |
| 键盘 Enter / Space | 屏幕获得焦点时打开当前作品 |
| 触屏左右滑动 | 切换作品；点击进入详情 |

过渡模式由 `settings.transition` 控制：

```js
transition: { mode: "roll", duration: 720 }
```

- `roll`：旧海报向上卷出，新海报从下方进入，接缝有暖色亮线（默认）。
- `wipe`：软边横向擦除。
- `fade`：交叉淡化。
- `prefers-reduced-motion: reduce` 时自动降为 120ms 淡入淡出。
- 过渡中再次切换会进入 `pending` 队列，不会丢输入，也不会叠两层动画。

---

## 4. 作品数据：单一来源

所有作品内容在 **`assets/projects.js`**：

```js
window.PORTFOLIO = {
  site: { name, role, location, intro, github, title, description, year },
  settings: { initial, clickScreen, transition, cameraDrift, bulbChase },
  projects: [ /* 5 个项目 */ ]
};
```

这个文件是 classic script，主页和详情页都直接读取它，不需要请求 JSON。改文案、换封面、加作品只改这一处（以及新增 `work/<slug>.html` 壳页）。

### 项目字段

| 字段 | 用途 |
| --- | --- |
| `slug` | URL 参数和详情页文件名，必须与 `work/<slug>.html` 一致 |
| `title` / `titleEn` / `tagline` | 广告牌标题、英文副题、标语 |
| `year` / `type` / `role` | 详情页元信息与海报角标 |
| `summary` | 主页信息栏与 fallback 卡片简介 |
| `description[2]` | 详情页 BRIEF 两段 |
| `stats[4]` | `{value,label}`，详情页关键数字 |
| `stack[3]` | `{name,items[]}`，技术栈分组 |
| `pipeline[4]` | `{step,title,text}`，制作链路 |
| `notes[3]` | `{title,text}`，设计笔记 |
| `cover` | 广告牌/SVG 封面路径，如 `assets/covers/city.svg` |
| `gallery[]` | `{src,alt,caption}`，详情页 ARCHIVE |
| `links` | `{live,source,note}`；没有公开链接时只写 `note` |
| `accent` / `accentDeep` | 当前作品主题色与深色底 |
| `poster` | `{layout,imageSide,background,foreground,stamp}`，海报双布局 |

### 封面与素材

`assets/covers/` 下有 11 张 1600×900 SVG，全部为本站重绘的矢量封面/画廊图：

- `city.svg`、`city-wall.svg`、`city-night.svg`
- `whale.svg`、`whale-night.svg`
- `packet.svg`、`packet-map.svg`
- `campus.svg`、`campus-api.svg`
- `shicuo.svg`、`shicuo-database.svg`

`assets/scene-skyline.svg`、`scene-car.svg`、`scene-props.svg` 是 Drive-in 场景剪影。全部无外部字体、无外部图片、无外链请求。

### 加一件作品

1. 在 `assets/covers/` 放一张 SVG/图片（建议 1600×900）。
2. 在 `projects.js` 的 `projects` 数组里加一项，复制现有项目字段并改内容。
3. 复制任意 `work/*.html` 为 `work/<新 slug>.html`，把 `<body data-work="...">` 改成新 slug；页面里的 `backIndex` 只是静态占位，运行时会更新。
4. 起始作品可改 `settings.initial`；底部编号和 `INDEX xx / 05` 会自动按数组长度生成。

---

## 5. 文件结构

```text
作品集/
├─ index.html                 # 主页：广告牌、Three.js 场景、信息栏、fallback
├─ README.md
├─ .github/workflows/pages.yml # GitHub Pages 自动部署
├─ qa/                        # 1440 / 1024 / 390 验收截图
├─ assets/
│  ├─ projects.js             # 唯一数据源
│  ├─ main.js                 # 主页：海报、切换、拖拽、URL、Three.js 初始化
│  ├─ scene3d.js              # Three.js：地面、道路、车、灯光、尘埃
│  ├─ detail.js               # 详情页渲染器（5 页共用）
│  ├─ style.css               # 主页视觉、CSS 广告牌、WebGL 层、响应式
│  ├─ detail.css              # 详情页视觉
│  ├─ favicon.svg
│  ├─ covers/                 # 11 张作品封面/画廊 SVG
│  ├─ scene-*.svg             # 夜景、越野车、电缆盘/路锥（无 WebGL 时使用）
│  └─ vendor/
│     ├─ three.min.js         # Three.js 0.160.0（本地 vendored）
│     └─ THREE-LICENSE.txt
└─ work/
   ├─ one-sentence-one-city.html
   ├─ little-whale-run.html
   ├─ packet-orb.html
   ├─ campus-book-market.html
   └─ shicuo.html
```

主页的广告牌结构：

- `.scene`：星空、月亮、雾、城市剪影、路灯光池，以及一张透明 WebGL canvas（地面、低多边形车、道路线、车灯与尘埃）。CSS 与 Three.js 共用同一套场景坐标和主题色；`body.has-webgl` 时隐藏重复的 CSS 地面/车/道具。
- `.billboard` > `.frame` > `.screen`：两块 `.poster-layer` 叠放，过渡时一进一出。
- `.screen` 的 `data-transition` 切换 `roll` / `wipe` / `fade`；`--dur` 控制时长。
- 顶部 `PROJECTS` 灯箱、底部 `NOW SHOWING` 灯箱、跑马灯泡和钢架由 CSS 绘制。
- `#info`、`#tabs`、`.controls` 是舞台的兄弟节点：桌面绝对定位在左下/底部，移动端自然流式排布。

---

## 6. 响应式与可访问性

- 桌面：`> 900px` 保持一屏舞台，信息栏在左下，广告牌在右侧，避免互相遮挡。
- 平板：广告牌宽度同时受 `60vw` 与 `88svh` 约束，短屏也不会顶出画面。
- `≤ 900px`：广告牌居中，信息栏移到舞台下方；广告牌宽度 `min(92vw, 72svh, 760px)`，保证上下都在舞台内。
- `≤ 620px`：隐藏车/道具/钢腿，压缩海报字号与页脚，底部编号只保留数字；广告牌仍完整可见。
- 详情页：`1080px` / `720px` 两档断点，hero 双栏在窄屏堆叠，画廊单列。
- `prefers-reduced-motion`：关闭漂移/闪烁，过渡改 120ms fade。
- 键盘：主页 ↑↓←→/Home/End/1–5/Enter/Space；详情页是普通文档流，使用 Tab 访问链接。
- 无 JS：主页显示静态的 5 条作品链接；详情页 `<noscript>` 给出作品摘要和可用的 Live/Source。
- 3D 不可用：`?nowebgl=1` 或 `?fallback=1` 显示同样的 5 张卡片网格，不黑屏。

---

## 7. 性能取舍

- 无远程请求：所有 CSS、JS、SVG 和 Three.js 都在本地；首屏没有字体/图片 CDN 往返。
- 主页只创建两块海报层，切换时复用 DOM；首张封面预加载，其余在空闲时预加载。
- 动画只用 `transform` / `opacity` / `clip-path`；页面隐藏时暂停 CSS 动画与 Three.js RAF。
- Three.js 只做背景增强：低面数地面、一辆低多边形车、道路线、灯光和尘埃；没有后处理、没有实时阴影贴图，DPR 桌面上限 1.75 / 移动 1.25，低端设备自动回退。
- 广告牌和所有可读文字仍是 CSS/DOM，不做 WebGL 文字；3D 不可用或 `?nowebgl=1` 时直接显示作品卡片网格。
- 详情页不加载 Three.js，只加载 `projects.js` + `detail.js` + `detail.css`。

---

## 8. 设计参考与边界

参考的是 Bruno Simon 的 **空间叙事**：把作品放进一个有地标、有光、有材质的场地里，让切换像换一块广告牌，而不是换一张卡片。本站保留：

- 单块巨幅广告牌 + 金属框/钢架/灯泡；
- 夜间 Drive-in 的雾、路灯、城市剪影、车与道具；
- 海报式排版（编号、双语标题、标语、条形码、NOW SHOWING）；
- 电影式的 roll/wipe/fade 换片。

没有保留/复制：

- Bruno 的可驾驶 3D 世界、Rapier 物理、模型与贴图；
- 其源码、字体、图片或品牌元素。

**为什么广告牌仍是 CSS，而场景用 Three.js**：广告牌需要承载可读中文、响应式排版和快速换片，CSS/DOM 在这些方面更稳；Three.js 负责它擅长的部分——地面透视、低多边形车、道路和灯光。两者共享夜间 Drive-in 的空间关系，而不是用 WebGL 重做所有文字和 UI。Three.js 以本地文件引入，不需要构建步骤，`file://` 也能直接打开。

---

## 9. 已验证 / 未验证

### 已做的静态检查

- 5 个项目、5 个 `work/*.html`，`data-work` 与 `slug` 一一对应。
- 11 张 cover/gallery SVG 全部存在，且都是 1600×900；数据中的 `cover`/`gallery.src` 都能解析到文件。
- 主页与 5 个详情页的 CSS/JS 引用路径正确；详情页图片通过 `../assets/` 解析，不会出现 `work/assets/...` 断图。
- 主页 `index.html` 在 1440 / 1180 / 1024 / 901 宽度下，信息栏与广告牌不水平重叠；900 / 620 / 390 下广告牌宽度受 `svh` 约束，不再被舞台裁切。
- 广告牌双层的 `z-index`、`touch-action`、重复 Enter 处理已修正。
- 没有外部 `src`/`url()`；所有本地资源都用相对路径。

### 已做的浏览器检查

- 用 Chrome headless 以 `--allow-file-access-from-files` 直接打开 `file://`，WebGL 通过 `--enable-unsafe-swiftshader --use-angle=swiftshader` 渲染：
  - `qa/three-home.png`（1440×1000）：单块广告牌、5 个 tab、信息栏、Three.js 车/地面/道路与灯光明暗正常；顶部 `PROJECTS / 05 SELECTED WORKS` 与底部 `NOW SHOWING` 间距正常。
  - `qa/three-mobile.png`（CDP 390×844）：`innerWidth=390`、`scrollWidth=390`；广告牌、箭头、信息栏与编号不重叠。
  - `qa/fallback.png`：`?nowebgl=1` 下 5 张卡片网格正常，标题不再重叠。
  - `qa/campus-desktop.png`（1440×1200）与 `qa/campus-mobile.png`（390×844）：详情页 hero 标题按两行排布，封面、meta、BRIEF 正常。
- 交互脚本已验证：5 个项目、next 按钮切到 02、点击屏幕进入 `work/little-whale-run.html`、`?work=shicuo` 直接打开 05、fallback 5 张卡片；`Runtime.exceptionThrown` / console error 为 0。
- 上述截图覆盖了视觉布局与断点；交互仍建议在真实浏览器里手点一遍。

### 未覆盖

- 未跑完整逐项 E2E（连续快速切换、详情 NEXT 循环、各链接 200 的自动化断言）。
- 未测 Firefox / Safari、真机触摸、动画帧率；这些需要真实浏览器或 CI 环境。
- 没有真实 3D 物理/驾驶；车是 Three.js 低多边形静态道具，广告牌切换是 CSS 动画。

### 已知限制

- **校园二手书交易平台**：README 曾写 `https://xiaojinyi1.github.io/campus-book-market/`，但当前该 URL 和 `xiaojinyi1/campus-book-market` 仓库均 404；因此详情页只显示“课程项目 · 未公开部署”，没有放死链。以后部署后把 `live`/`source` 加回 `projects.js` 即可。

---

## 10. 作品链接

- [一句话，一座城](https://xiaojinyi1.github.io/one-sentence-one-city/) · [源码](https://github.com/xiaojinyi1/one-sentence-one-city)
- [小鲸鱼快跑](https://little-whale-run.vercel.app) · [源码](https://github.com/xiaojinyi1/little-whale-run)
- [Packet Orb](https://xiaojinyi1.github.io/-packet-orb/) · [源码](https://github.com/xiaojinyi1/-packet-orb)
- [拾错](https://xiaojinyi1.github.io/shicuo/) · [源码](https://github.com/xiaojinyi1/shicuo)

---

JINYI · 2025 · Wuhan
