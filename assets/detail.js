/* Renders one case-study page from window.PORTFOLIO. Classic script so the
   page also works when opened directly from disk (file://). */
(function () {
  "use strict";

  var data = window.PORTFOLIO;
  var root = document.getElementById("detailRoot");
  if (!data || !root) return;

  var projects = data.projects || [];
  var slug = document.body.getAttribute("data-work");
  var index = -1;
  var i;

  for (i = 0; i < projects.length; i += 1) {
    if (projects[i].slug === slug) { index = i; break; }
  }

  if (index < 0) {
    root.innerHTML = '<div class="detail-error"><p class="kicker">CASE FILE NOT FOUND</p><h1>这个作品不在这里。</h1><p><a class="btn" href="../index.html">返回广告牌</a></p></div>';
    return;
  }

  var project = projects[index];
  var total = projects.length;
  var number = pad(index + 1);
  var next = projects[(index + 1) % total];
  var nextNumber = pad(((index + 1) % total) + 1);

  document.documentElement.classList.add("js");
  document.documentElement.style.setProperty("--accent", project.accent || "#E3A45C");
  document.documentElement.style.setProperty("--accent-deep", project.accentDeep || "#2B1A11");
  document.body.style.setProperty("--accent", project.accent || "#E3A45C");
  document.title = project.title + " — " + (data.site && data.site.name ? data.site.name : "JINYI");
  updateMeta("description", project.summary || "");
  updateMeta("theme-color", "#08080a");

  var backHref = "../index.html?work=" + encodeURIComponent(project.slug);
  var back = document.querySelector(".detail-back");
  if (back) back.setAttribute("href", backHref);
  var backIndex = document.getElementById("backIndex");
  if (backIndex) backIndex.textContent = number;

  var links = project.links || {};
  var actions = "";
  if (safeUrl(links.live)) {
    actions += '<a class="btn btn-primary" href="' + escapeAttr(links.live) + '" target="_blank" rel="noopener noreferrer">LIVE DEMO <span aria-hidden="true">↗</span></a>';
  }
  if (safeUrl(links.source)) {
    actions += '<a class="btn" href="' + escapeAttr(links.source) + '" target="_blank" rel="noopener noreferrer">SOURCE <span aria-hidden="true">↗</span></a>';
  }
  if (!actions) {
    actions = '<span class="btn" aria-disabled="true">' + escapeHTML(links.note || "课程项目 · 未公开部署") + '</span>';
  }
  var linkNote = links.note && actions.indexOf("aria-disabled") === -1 ? escapeHTML(links.note) : (links.note ? "" : "External links open in a new tab.");

  var meta = [
    { label: "YEAR", value: project.year },
    { label: "TYPE", value: project.type },
    { label: "ROLE", value: project.role }
  ].map(function (item) {
    return '<div><dt>' + escapeHTML(item.label) + '</dt><dd>' + escapeHTML(item.value) + '</dd></div>';
  }).join("");

  var stats = (project.stats || []).map(function (stat) {
    return '<div><dt>' + escapeHTML(stat.label) + '</dt><dd>' + escapeHTML(stat.value) + '</dd></div>';
  }).join("");

  var pipeline = (project.pipeline || []).map(function (step) {
    return '<article class="pipeline-card"><h3>' + escapeHTML(step.title) + '</h3><p>' + escapeHTML(step.text) + '</p></article>';
  }).join("");

  var stack = (project.stack || []).map(function (group) {
    return '<article class="stack-card"><h3>' + escapeHTML(group.name) + '</h3><ul>' +
      group.items.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join("") +
      '</ul></article>';
  }).join("");

  var notes = (project.notes || []).map(function (note, n) {
    return '<article class="note-card"><span>NOTE ' + pad(n + 1) + '</span><h3>' + escapeHTML(note.title) + '</h3><p>' + escapeHTML(note.text) + '</p></article>';
  }).join("");

  var gallery = "";
  if (project.gallery && project.gallery.length) {
    gallery = project.gallery.map(function (shot, n) {
      return '<figure class="gallery-card"><div class="shot"><img src="' + escapeAttr(assetPath(shot.src)) + '" alt="' + escapeAttr(shot.alt || "") + '" loading="lazy" decoding="async"></div><figcaption><span>' + escapeHTML(shot.caption || "Archive") + '</span><span>ARCHIVE ' + pad(n + 1) + '</span></figcaption></figure>';
    }).join("");
    gallery = section("gallery", "ARCHIVE", "06", "档案", '<div class="gallery-grid">' + gallery + '</div>');
  }

  var description = (project.description || []).map(function (p) {
    return '<p>' + escapeHTML(p) + '</p>';
  }).join("");

  var hero = '' +
    '<section class="detail-hero">' +
      '<div class="hero-copy">' +
        '<p class="kicker">SELECTED WORK / ' + number + ' OF ' + pad(total) + '</p>' +
        '<h1 class="hero-title">' + escapeHTML(project.title) + '</h1>' +
        '<p class="hero-title-en">' + escapeHTML(project.titleEn) + '</p>' +
        '<p class="hero-tagline">' + escapeHTML(project.tagline) + '</p>' +
        '<dl class="hero-meta">' + meta + '</dl>' +
        '<div class="hero-actions">' + actions + '</div>' +
        (linkNote ? '<p class="hero-link-note">' + linkNote + '</p>' : '') +
      '</div>' +
      '<div class="hero-visual">' +
        '<div class="poster-wrap">' +
          '<div class="poster-image">' +
            '<img src="' + escapeAttr(assetPath(project.cover)) + '" alt="' + escapeAttr(project.title + " 封面") + '" fetchpriority="high" decoding="async">' +
            '<span class="poster-tag">' + escapeHTML((project.poster && project.poster.stamp) || ("SELECTED " + number)) + '</span>' +
          '</div>' +
          '<div class="poster-caption"><span>CASE FILE / ' + number + '</span><span>' + escapeHTML((data.site && data.site.name) || "JINYI") + ' / ' + escapeHTML(project.year) + '</span></div>' +
        '</div>' +
        '<div class="hero-side-note">SCROLL TO READ / CASE ' + number + '</div>' +
      '</div>' +
    '</section>';

  var sections = '' +
    section("brief", "BRIEF", "01", "关于这件作品", '<div class="brief">' + description + '</div>') +
    section("stats", "BY THE NUMBERS", "02", "关键数字", '<dl class="stats-grid">' + stats + '</dl>') +
    section("pipeline", "PROCESS", "03", "制作链路", '<div class="pipeline">' + pipeline + '</div>') +
    section("stack", "TOOLKIT", "04", "技术栈", '<div class="stack-grid">' + stack + '</div>') +
    section("notes", "DESIGN NOTES", "05", "设计笔记", '<div class="notes-grid">' + notes + '</div>') +
    gallery;

  var nextBlock = '' +
    '<section class="next-section reveal" aria-label="下一个作品">' +
      '<a class="next-link" href="' + escapeAttr(next.slug + ".html") + '">' +
        '<div class="next-copy">' +
          '<span class="next-label">NEXT CASE / ' + nextNumber + ' OF ' + pad(total) + '</span>' +
          '<div><h2>' + escapeHTML(next.title) + '</h2><p>' + escapeHTML(next.tagline) + '</p></div>' +
        '</div>' +
        '<div class="next-art"><img src="' + escapeAttr(assetPath(next.cover)) + '" alt="" loading="lazy" decoding="async"></div>' +
      '</a>' +
    '</section>';

  var footer = '' +
    '<footer class="detail-foot">' +
      '<span>© ' + escapeHTML((data.site && data.site.year) || project.year) + ' ' + escapeHTML((data.site && data.site.name) || "JINYI") + ' — ' + escapeHTML(project.title) + '</span>' +
      '<span><a href="' + escapeAttr(backHref) + '">BACK TO BILLBOARD</a> &nbsp;/&nbsp; <a href="' + escapeAttr((data.site && data.site.github) || "https://github.com/xiaojinyi1") + '" target="_blank" rel="noopener noreferrer">GITHUB ↗</a></span>' +
    '</footer>';

  root.innerHTML = hero + sections + nextBlock + footer;
  revealAll();

  function assetPath(value) {
    var path = String(value == null ? "" : value);
    if (path.indexOf("http://") === 0 || path.indexOf("https://") === 0 || path.indexOf("//") === 0) return path;
    if (path.indexOf("../") === 0 || path.charAt(0) === "/") return path;
    return "../" + path;
  }

  function section(id, label, num, title, body) {
    return '<section class="section reveal" id="' + id + '">' +
      '<div class="section-head">' +
        '<p class="section-label">' + escapeHTML(label) + ' <span>' + escapeHTML(num) + '</span></p>' +
        '<h2 class="section-title">' + escapeHTML(title) + '</h2>' +
      '</div>' +
      '<div class="section-body">' + body + '</div>' +
    '</section>';
  }

  function revealAll() {
    var items = root.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      for (var n = 0; n < items.length; n += 1) items[n].classList.add("is-in");
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    for (var k = 0; k < items.length; k += 1) observer.observe(items[k]);
  }

  function updateMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
})();

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}

function safeUrl(url) {
  if (typeof url !== "string") return false;
  return url.indexOf("https://") === 0 || url.indexOf("http://") === 0;
}

function escapeHTML(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}
