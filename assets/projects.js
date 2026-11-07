/* Single source of truth for the portfolio. Classic script so the site also
   works when index.html is opened directly from disk (file://). */
window.PORTFOLIO = {
  site: {
    name: "JINYI",
    role: "Creative Developer / 全栈与 3D",
    location: "Wuhan, CN",
    intro: "把想法做成可以走进去的网页。",
    github: "https://github.com/xiaojinyi1",
    title: "JINYI — Selected Works",
    description: "五件作品，一块广告牌。夜间 Drive-in 里的个人作品集。",
    year: "2025"
  },
  settings: {
    initial: "one-sentence-one-city",
    clickScreen: "open",
    transition: { mode: "roll", duration: 720 },
    cameraDrift: true,
    bulbChase: true
  },
  projects: [
    {
      slug: "one-sentence-one-city",
      title: "一句话，一座城",
      titleEn: "ONE SENTENCE, ONE CITY",
      tagline: "打一句话，看它长成一座城",
      year: "2025",
      type: "生成式 3D / 互动叙事",
      role: "概念 · 3D · 前端",
      summary: "把一句中文拆成语义坐标，让城市在几秒内长出来。",
      description: [
        "《一句话，一座城》把输入的中文句子拆成语义坐标：字词密度变成楼层高度，停顿变成长街，重复变成塔楼。城市不是预建模的，而是在 0.5–0.7 秒里从地面升起。",
        "项目坚持零外部资源：所有建筑、窗户、天空与灯光都由代码生成。双城对比、城市墙和三套天色把一次生成延伸成一座可以慢慢逛的语义城市。"
      ],
      stats: [
        { value: "1", label: "句话生成" },
        { value: "3", label: "套天色" },
        { value: "12", label: "draw calls / 双城" },
        { value: "0.7s", label: "城市生长" }
      ],
      stack: [
        { name: "CORE", items: ["Three.js", "Vite", "Canvas"] },
        { name: "LANGUAGE", items: ["中文语义", "程序化生成", "低多边形"] },
        { name: "DELIVERY", items: ["GitHub Pages", "零外部资源", "移动端适配"] }
      ],
      pipeline: [
        { step: "01", title: "输入", text: "一句中文，保留标点、重复与停顿。" },
        { step: "02", title: "语义坐标", text: "字词密度、停顿与重复映射为高度、街区和塔楼。" },
        { step: "03", title: "城市生长", text: "0.5–0.7 秒的升起动画，灯光随天色点亮。" },
        { step: "04", title: "双城 / 城市墙", text: "同屏比较两座城，或把句子存进城市墙。" }
      ],
      notes: [
        { title: "语义不是装饰", text: "每个字都会改变城市的高度、密度与街道走向，输入与结果之间保留可追溯的映射。" },
        { title: "为移动端做减法", text: "双城同屏控制在 12 个 draw call；低多边形不是风格滤镜，而是让手机也能在同一帧里比较两座城。" },
        { title: "句子成为档案", text: "城市墙把一次性的生成结果变成可回看的档案；点击任意一格，会带着那句话回到主视图重新建城。" }
      ],
      cover: "assets/covers/city.svg",
      gallery: [
        { src: "assets/covers/city-wall.svg", alt: "城市墙：一面由句子和建筑组成的档案墙", caption: "城市墙 / 句子被保存为可回看的建筑" },
        { src: "assets/covers/city-night.svg", alt: "夜间模式下的低多边形城市", caption: "夜色 / 同一座城的另一套灯光" }
      ],
      links: {
        live: "https://xiaojinyi1.github.io/one-sentence-one-city/",
        source: "https://github.com/xiaojinyi1/one-sentence-one-city"
      },
      accent: "#E3A45C",
      accentDeep: "#2B1A11",
      poster: {
        layout: "split",
        imageSide: "right",
        background: "#2B1A11",
        foreground: "#F6E7CE",
        stamp: "SELECTED 01"
      }
    },
    {
      slug: "little-whale-run",
      title: "小鲸鱼快跑",
      titleEn: "LITTLE WHALE RUN",
      tagline: "在潮汐与夜色之间，一直往前跑",
      year: "2025",
      type: "游戏 / Canvas 2D",
      role: "玩法 · 视觉 · 前端",
      summary: "零依赖的横版跑酷：长按跳得更高，下潜穿过悬浮岩架，500 分后进入夜航。",
      description: [
        "一款零依赖的 Canvas 2D 横版跑酷。长按跳得更高，轻点小跳，向下滑过悬浮岩架；速度从 360 逐渐推到 780，每 100 分再加 30。",
        "500 分后从白昼海面切到深海夜航，月相、云层、水母和鲸鱼一起换色。逻辑世界固定 960×540，DPR 上限 2.5，AABB 内缩 3px，让判定和画面一样诚实。"
      ],
      stats: [
        { value: "960×540", label: "逻辑世界" },
        { value: "0", label: "第三方依赖" },
        { value: "500", label: "分昼夜切换" },
        { value: "2.5", label: "DPR 上限" }
      ],
      stack: [
        { name: "CORE", items: ["Canvas 2D", "Vanilla JS", "requestAnimationFrame"] },
        { name: "FEEL", items: ["重力 2260", "起跳 -860", "AABB 内缩 3px"] },
        { name: "DELIVERY", items: ["localStorage", "Vercel", "GitHub Pages"] }
      ],
      pipeline: [
        { step: "01", title: "输入", text: "空格 / 点击 / 触屏长按；下潜键穿过悬浮岩架。" },
        { step: "02", title: "物理 / AABB", text: "固定逻辑世界、内缩判定，长按与轻点对应不同跳跃高度。" },
        { step: "03", title: "难度与昼夜", text: "速度随分数增长，500 分切换月相、云层与深海配色。" },
        { step: "04", title: "结算 / 最佳分", text: "localStorage 只保存最佳分，重新打开就能继续。" }
      ],
      notes: [
        { title: "手感优先", text: "重力 2260、起跳 -860；长按与轻点的差异来自按住时长，而不是两套按钮。" },
        { title: "连续的难度曲线", text: "速度随分数增长，每 100 分再加 30；500 分用一次昼夜切换给玩家明确的阶段感。" },
        { title: "没有后端也能完整", text: "只把最佳分写进 localStorage；没有账号、没有网络请求，打开就能跑。" }
      ],
      cover: "assets/covers/whale.svg",
      gallery: [
        { src: "assets/covers/whale-night.svg", alt: "深海夜航模式：月亮、水母与夜光鲸鱼", caption: "Night Passage / 500 分后的深海夜航" }
      ],
      links: {
        live: "https://little-whale-run.vercel.app",
        source: "https://github.com/xiaojinyi1/little-whale-run"
      },
      accent: "#4FC3D9",
      accentDeep: "#062A36",
      poster: {
        layout: "full",
        imageSide: "right",
        background: "#062A36",
        foreground: "#E9FBFF",
        stamp: "SELECTED 02"
      }
    },
    {
      slug: "packet-orb",
      title: "Packet Orb",
      titleEn: "PACKET ORB",
      tagline: "把 traceroute 开成一座低多边形迷宫",
      year: "2025",
      type: "实验性 3D / 数据可视化",
      role: "3D · 物理 · 前端",
      summary: "延迟是坡度，丢包是坑洞，ASN 变化是拱门与换色。",
      description: [
        "把一段 traceroute 结果变成可驾驶的 low-poly 网络迷宫。延迟是坡度，丢包是坑洞，抖动是蹦床，匿名跳是迷雾隧道，ASN 变化是拱门与换色。",
        "Rapier 物理在 Web Worker 里固定 1/60 步长；渲染层用 matcap 与单张 2048 directional shadow map 控制预算。分享链接用自实现 LZSS + base64url 把整份 trace 压进 URL hash，超过 8KB 自动降级为逐跳摘要。"
      ],
      stats: [
        { value: "120k", label: "三角面上限" },
        { value: "120", label: "draw calls" },
        { value: "3", label: "画质档" },
        { value: "4MB", label: "首屏 gzip" }
      ],
      stack: [
        { name: "CORE", items: ["Three.js", "Rapier", "TypeScript"] },
        { name: "SYSTEM", items: ["traceroute 解析", "LayoutSolver", "LZSS 分享"] },
        { name: "DELIVERY", items: ["Vite", "Web Worker", "GitHub Pages"] }
      ],
      pipeline: [
        { step: "01", title: "traceroute", text: "粘贴真实终端输出，或使用明确标注的合成样本。" },
        { step: "02", title: "LayoutSolver", text: "把每跳映射成坡度、坑洞、蹦床、雾隧道与 ASN 色带。" },
        { step: "03", title: "物理 / 渲染", text: "Rapier 固定 1/60 步长；三档画质在移动端自动降级。" },
        { step: "04", title: "分享 / 结算", text: "LZSS 编码链接；到站后播放延迟瀑布与丢包回放。" }
      ],
      notes: [
        { title: "诚实的失真", text: "距离做 sqrt 压缩：12 + 8·√avgMs 米；否则 300ms 的一段会有几公里长，地图不可玩。" },
        { title: "不伪造拓扑", text: "连续匿名跳合并成一段未知，而不是逐跳编造；结算只给相对结论，不冒充网络测量工具。" },
        { title: "为预算而设计", text: "静态场景 ≤120k 三角面、≤120 draw call、≤18 材质；WebGL 不可用时输出 SVG 俯视迷宫。" }
      ],
      cover: "assets/covers/packet.svg",
      gallery: [
        { src: "assets/covers/packet-map.svg", alt: "Packet Orb 的俯视路线图：节点、色带与丢包坑洞", caption: "LayoutSolver / traceroute 节点的空间映射" }
      ],
      links: {
        live: "https://xiaojinyi1.github.io/-packet-orb/",
        source: "https://github.com/xiaojinyi1/-packet-orb"
      },
      accent: "#6FE3D2",
      accentDeep: "#100E2A",
      poster: {
        layout: "full",
        imageSide: "right",
        background: "#100E2A",
        foreground: "#EEEBFF",
        stamp: "SELECTED 03"
      }
    },
    {
      slug: "campus-book-market",
      title: "校园二手书交易平台",
      titleEn: "CAMPUS BOOK MARKET",
      tagline: "用最少的零件，跑通一次全栈",
      year: "2025",
      type: "全栈教学示例 / PostgreSQL",
      role: "前端 · Node HTTP · PostgreSQL",
      summary: "原生页面通过 fetch 调用 Node HTTP 接口，把浏览、发布、状态流转与静态快照降级串成一条完整链路。",
      description: [
        "面向课程“开发与部署”练习：前端无框架、无构建步骤；后端 Node 原生 http + PostgreSQL。GET/POST /api/books、PATCH 状态、分类与健康检查；GitHub Pages 静态托管时自动退回 books.json 快照，发布与改状态给出明确提示。",
        "数据库 4 张表：categories、owners、books、book_status_events。价格以分存储，ISBN 部分唯一索引，状态事件留痕，updated_at 由触发器维护，v_books 作为列表/详情读模型。仓库保留 feature 分支与 --no-ff 合并历史；README 记录初始化、环境限制与验收步骤。"
      ],
      stats: [
        { value: "4", label: "业务表" },
        { value: "6", label: "API 端点" },
        { value: "1", label: "状态事件表" },
        { value: "0", label: "前端依赖" }
      ],
      stack: [
        { name: "FRONTEND", items: ["HTML / CSS / JS", "Fetch", "无构建步骤"] },
        { name: "BACKEND", items: ["Node 原生 http", "PostgreSQL", "参数化查询"] },
        { name: "DATABASE", items: ["4 张表", "约束 / 触发器", "v_books 视图"] }
      ],
      pipeline: [
        { step: "01", title: "原生页面", text: "浏览在售 / 已预订 / 已售教材，填写发布表单。" },
        { step: "02", title: "REST API", text: "GET / POST / PATCH，统一 {code,msg,data} 响应。" },
        { step: "03", title: "PostgreSQL", text: "4 张表、ISBN 唯一索引、状态事件与 v_books 视图。" },
        { step: "04", title: "降级 / 部署", text: "完整模式 Node + PG；静态托管退回 books.json。" }
      ],
      notes: [
        { title: "先约束，再接口", text: "价格用分、ISBN 部分唯一、状态/成色枚举；数据库负责底线，API 只做参数化查询。" },
        { title: "状态是事件，不是覆盖", text: "每次流转写 book_status_events；sold_at 独立记录成交时间，历史可追溯。" },
        { title: "静态托管不等于全栈", text: "GitHub Pages 只能跑 public/ 与快照；发布/改状态需要 Node + PostgreSQL。" }
      ],
      cover: "assets/covers/campus.svg",
      gallery: [
        { src: "assets/covers/campus-api.svg", alt: "校园二手书平台的请求链路：页面、Node HTTP、PostgreSQL 与静态快照", caption: "请求链路 / 前端、Node HTTP、PostgreSQL 与静态快照" }
      ],
      links: {
        note: "课程项目 · 未公开部署"
      },
      accent: "#6C7CFF",
      accentDeep: "#10162B",
      poster: {
        layout: "split",
        imageSide: "left",
        background: "#10162B",
        foreground: "#EDF1FF",
        stamp: "SELECTED 04"
      }
    },
    {
      slug: "shicuo",
      title: "拾错",
      titleEn: "SHICUO",
      tagline: "把每一次失误，整理成下一次的底气",
      year: "2025",
      type: "全栈产品 / 数据库设计",
      role: "产品 · 全栈 · 数据库设计",
      summary: "把错题整理、间隔复习与公开共享做成完整产品；页面、权限与数据库关系一起设计。",
      description: [
        "面向学生与教师：错题录入、三档可见性、错题本、SM-2 间隔复习、收藏/评论/克隆、公开广场、通知、举报与管理审计，构成一条完整的学习闭环。",
        "数据库有 15 张业务表、8 个枚举、30+ 条 RLS、2 个 RPC。profiles.id 同时是 auth.users.id 外键；visibility 与 status 分离；comments 复合外键防跨题回复；reports 用 num_nonnulls 约束目标；review_schedules 存当前排期，review_logs 存历史。"
      ],
      stats: [
        { value: "15", label: "业务表" },
        { value: "30+", label: "RLS 策略" },
        { value: "21", label: "路由构建通过" },
        { value: "0", label: "TypeScript 错误" }
      ],
      stack: [
        { name: "FRONTEND", items: ["Next.js 15", "React 19", "TypeScript strict", "Tailwind"] },
        { name: "DATA", items: ["Supabase", "PostgreSQL", "RLS", "RPC"] },
        { name: "PLATFORM", items: ["Auth", "Storage", "Realtime", "Edge Functions"] }
      ],
      pipeline: [
        { step: "01", title: "错题录入", text: "题干、答案、错因复盘、难度、来源、学科与标签。" },
        { step: "02", title: "可见性 / 状态", text: "私有 / 链接可见 / 公开；草稿 / 已发布 / 已归档。" },
        { step: "03", title: "RLS + 触发器", text: "页面守卫负责体验，数据库策略负责底线。" },
        { step: "04", title: "复习 / 广场", text: "SM-2 排期、到期提醒、公开错题与克隆血缘。" }
      ],
      notes: [
        { title: "页面守卫负责体验，RLS 负责底线", text: "即使用户绕过前端、拿 anon key 直接请求 PostgREST，也只能读到 policy 允许的行。" },
        { title: "关系交给外键", text: "复合外键阻止跨题回复，num_nonnulls 让举报必须且只能指向一个对象；计数由触发器原子维护。" },
        { title: "当前与历史分开", text: "review_schedules 只存下一次到期，review_logs 保留每次评分；排期可以覆盖，学习历史不会丢。" }
      ],
      cover: "assets/covers/shicuo.svg",
      gallery: [
        { src: "assets/covers/shicuo-database.svg", alt: "拾错数据库设计页：表分组、外键与 RLS 的关系图", caption: "Database Design / 15 张表与五组关系" }
      ],
      links: {
        live: "https://xiaojinyi1.github.io/shicuo/",
        source: "https://github.com/xiaojinyi1/shicuo"
      },
      accent: "#C8553D",
      accentDeep: "#2E4139",
      poster: {
        layout: "split",
        imageSide: "right",
        background: "#F3EBDD",
        foreground: "#1F3A32",
        stamp: "SELECTED 05"
      }
    }
  ]
};
