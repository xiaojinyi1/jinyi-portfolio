/* JINYI — homepage controller.
   Classic script on purpose: index.html must work when opened from disk. */
(function () {
  "use strict";

  var data = window.PORTFOLIO;
  if (!data || !Array.isArray(data.projects) || !data.projects.length) return;

  var projects = data.projects;
  var profile = data.profile || null;
  var profileItem = profile ? {
    isProfile: true,
    slug: profile.slug || "profile",
    title: profile.title || "JINYI",
    titleEn: profile.titleEn || "PROFILE",
    tagline: profile.tagline || "",
    year: profile.year || (data.site && data.site.year) || "2025",
    type: profile.type || "个人档案 / PROFILE",
    role: profile.role || "",
    summary: profile.summary || "",
    bio: profile.bio || [],
    profileNote: profile.profileNote || "",
    stack: [{ name: "KEY", items: ["GPA 3.9", "Python 二级", "CET-4"] }],
    accent: profile.accent || "#E3A45C",
    accentDeep: profile.accentDeep || "#17130E",
    cover: "",
    poster: profile.poster || { background: "#17130E", foreground: "#F4EBDD", stamp: "PROFILE / 00" },
    facts: profile.facts || []
  } : null;
  var items = profileItem ? [profileItem].concat(projects) : projects;
  var site = data.site || {};
  var settings = data.settings || {};
  var total = items.length;
  var worksTotal = projects.length;
  var totalLabel = pad(worksTotal);
  function numberFor(index) {
    return profileItem ? index : index + 1;
  }
  var app = document.getElementById("app");
  var stage = document.getElementById("stage");
  var scene = document.getElementById("scene");
  var screen = document.getElementById("screen");
  var billboard = document.getElementById("billboard");
  var bulbs = document.getElementById("bulbs");
  var tabs = document.getElementById("tabs");
  var info = document.getElementById("info");
  var loader = document.getElementById("loader");
  var cursorLabel = document.getElementById("cursorLabel");
  var fallbackGrid = document.getElementById("fallbackGrid");
  var profileSheet = document.getElementById("profileSheet");
  var profileMore = document.getElementById("profileMore");
  var profileBio = document.getElementById("profileBio");
  var profileStory = document.getElementById("profileStory");
  var profileNote = document.getElementById("profileNote");
  var layers = [document.getElementById("posterA"), document.getElementById("posterB")];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  var state = {
    index: 0,
    activeLayer: 0,
    transitioning: false,
    pending: null,
    ready: false,
    drag: null,
    suppressClick: false,
    lastWheel: 0
  };
  var preloaded = Object.create(null);
  var raf = null;
  var pointer = { x: 0, y: 0 };
  var wheelLock = 0;

  document.documentElement.classList.remove("no-js");
  if (!app || !stage || !screen || !billboard || !layers[0] || !layers[1]) return;

  function $(selector, root) { return (root || document).querySelector(selector); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function indexFromUrl() {
    try {
      var slug = new URLSearchParams(window.location.search).get("work");
      if (!slug) return -1;
      if (profileItem && slug === profileItem.slug) return 0;
      for (var i = 0; i < projects.length; i += 1) {
        if (projects[i].slug === slug) return i + (profileItem ? 1 : 0);
      }
    } catch (error) { /* file:// with a strict browser */ }
    return -1;
  }
  function initialIndex() {
    var fromUrl = indexFromUrl();
    if (fromUrl >= 0) return fromUrl;
    if (profileItem && settings.initial === profileItem.slug) return 0;
    for (var i = 0; i < projects.length; i += 1) {
      if (projects[i].slug === settings.initial) return i + (profileItem ? 1 : 0);
    }
    return 0;
  }

  /* --------------------------------------------------------------- posters */
  function profileFactsMarkup(facts, className) {
    return (facts || []).map(function (fact) {
      return '<article class="' + className + (fact.highlight ? " is-highlight" : "") + '">' +
        '<span class="profile-fact-label">' + esc(fact.label) + "</span>" +
        '<strong class="profile-fact-value">' + esc(fact.value) + "</strong>" +
        '<span class="profile-fact-detail">' + esc(fact.detail) + "</span>" +
      "</article>";
    }).join("");
  }

  function profileStoryMarkup(facts) {
    var order = ["gpa", "education", "research", "certs", "interests"];
    var byId = Object.create(null);
    var ordered = [];
    (facts || []).forEach(function (fact) {
      byId[fact.id] = fact;
    });
    order.forEach(function (id) {
      if (byId[id]) ordered.push(byId[id]);
    });
    (facts || []).forEach(function (fact) {
      if (ordered.indexOf(fact) < 0) ordered.push(fact);
    });
    return ordered.map(function (fact) {
      return '<article class="profile-story-card' + (fact.highlight ? " is-highlight" : "") + '">' +
        '<span class="profile-story-label">' + esc(fact.label) + "</span>" +
        '<strong class="profile-story-value">' + esc(fact.value) + "</strong>" +
        '<p class="profile-story-text">' + esc(fact.story || fact.detail) + "</p>" +
      "</article>";
    }).join("");
  }

  function buildProfileDossier() {
    if (!profileItem) return;
    var bio = profileItem.bio && profileItem.bio.length ? profileItem.bio : [profileItem.summary];
    if (profileBio) {
      profileBio.innerHTML = bio.map(function (paragraph) {
        return "<p>" + esc(paragraph) + "</p>";
      }).join("");
    }
    if (profileStory) profileStory.innerHTML = profileStoryMarkup(profileItem.facts);
    if (profileNote) profileNote.textContent = profileItem.profileNote || "";
  }

  function buildProfilePoster(layer, item) {
    var facts = item.facts || [];
    var gpa = null;
    var secondary = [];
    facts.forEach(function (fact) {
      if (fact.highlight && !gpa) gpa = fact;
      else if (!fact.highlight) secondary.push(fact);
    });
    var cards = secondary.slice(0, 4).map(function (fact) {
      return '<article class="pp-fact">' +
        '<span class="pp-label">' + esc(fact.label) + "</span>" +
        '<strong class="pp-value">' + esc(fact.value) + "</strong>" +
        '<span class="pp-detail">' + esc(fact.detail) + "</span>" +
      "</article>";
    }).join("");

    layer.innerHTML =
      '<article class="poster poster-profile">' +
        '<div class="pp-bg" aria-hidden="true"></div>' +
        '<div class="pp-copy">' +
          '<div class="pp-kicker"><span>' + esc(item.poster.stamp || "PROFILE / 00") + "</span>" +
            "<span>WUHAN, CN · " + esc(item.year) + "</span></div>" +
          '<div class="pp-body">' +
            '<div class="pp-identity">' +
              '<p class="pp-eyebrow">HELLO, I AM</p>' +
              '<h2 class="pp-name">' + esc(item.title) + "</h2>" +
              '<p class="pp-role">' + esc(item.tagline) + "</p>" +
              '<div class="pp-gpa"><span>GPA</span><strong>' + esc(gpa ? gpa.value : "3.9") + "</strong><span>绩点</span></div>" +
            "</div>" +
            '<div class="pp-grid">' + cards + "</div>" +
          "</div>" +
          '<div class="pp-foot"><span><b>PROFILE</b> · 个人档案</span><span>PORTFOLIO / ' + esc(item.year) + "</span></div>" +
        "</div>" +
      "</article>";

    var poster = layer.firstElementChild;
    poster.style.setProperty("--poster-bg", item.poster.background);
    poster.style.setProperty("--poster-fg", item.poster.foreground);
    poster.style.setProperty("--stamp-color", item.accent);
    poster.style.setProperty("--accent", item.accent);
    layer.dataset.slug = item.slug;
    layer.dataset.index = "0";
    layer.dataset.profile = "true";
    layer.setAttribute("aria-hidden", "true");
  }

  function buildPoster(layer, project, index) {
    if (project.isProfile) {
      buildProfilePoster(layer, project);
      return;
    }
    layer.dataset.profile = "false";
    var layout = project.poster && project.poster.layout === "full" ? "full" : "split";
    layer.innerHTML =
      '<article class="poster" data-layout="' + layout + '">' +
        '<div class="poster-art" aria-hidden="true"></div>' +
        '<div class="poster-copy">' +
          '<div class="poster-kicker"><span class="stamp"></span><span class="year"></span></div>' +
          '<div class="poster-main">' +
            '<div class="poster-index"></div>' +
            '<h2 class="poster-title"></h2>' +
            '<p class="poster-en"></p>' +
            '<p class="poster-tagline"></p>' +
          '</div>' +
          '<div class="poster-foot">' +
            '<div class="poster-meta"><b></b><span></span></div>' +
            '<div class="barcode" aria-hidden="true"></div>' +
            '<div class="now-showing">NOW SHOWING</div>' +
          '</div>' +
        '</div>' +
        '<div class="poster-halftone" aria-hidden="true"></div>' +
      '</article>';

    var poster = layer.firstElementChild;
    var art = $(".poster-art", poster);
    var meta = $(".poster-meta", poster);
    poster.style.setProperty("--poster-bg", project.poster.background);
    poster.style.setProperty("--poster-fg", project.poster.foreground);
    poster.style.setProperty("--stamp-color", project.accent);
    if (layout === "split" && project.poster.imageSide === "left") poster.classList.add("image-left");
    art.style.backgroundImage = 'url("' + project.cover + '")';
    $(".stamp", poster).textContent = project.poster.stamp || ("SELECTED " + pad(numberFor(index)));
    $(".year", poster).textContent = project.year || "";
    $(".poster-index", poster).textContent = pad(numberFor(index)) + " / " + totalLabel;
    var title = $(".poster-title", poster);
    title.textContent = project.title;
    if (project.title.length > 8) title.classList.add("is-long");
    $(".poster-en", poster).textContent = project.titleEn || "";
    $(".poster-tagline", poster).textContent = project.tagline || "";
    $(".poster-meta b", poster).textContent = project.type || "";
    $(".poster-meta span", poster).textContent = project.role || "";
    meta.setAttribute("aria-label", project.type + " / " + project.role);
    layer.dataset.slug = project.slug;
    layer.dataset.index = String(index);
    layer.setAttribute("aria-hidden", "true");
  }

  function preload(project) {
    if (!project.cover) return Promise.resolve();
    if (preloaded[project.cover]) return Promise.resolve();
    return new Promise(function (resolve) {
      var settled = false;
      var finish = function () {
        if (settled) return;
        settled = true;
        preloaded[project.cover] = true;
        resolve();
      };
      var img = new Image();
      img.onload = finish;
      img.onerror = finish;
      img.src = project.cover;
      window.setTimeout(finish, 1600);
    });
  }

  function updateUI(project, index) {
    var isProfile = !!project.isProfile;
    var number = numberFor(index);
    var topIndex = document.getElementById("topIndex");
    var topTotal = document.getElementById("topTotal");
    if (topIndex) topIndex.textContent = pad(number);
    if (topTotal) topTotal.textContent = totalLabel;
    var signCount = document.getElementById("signCount");
    if (signCount) signCount.textContent = totalLabel;
    var signLabel = document.getElementById("signLabel");
    if (signLabel) signLabel.textContent = isProfile ? "PROFILE" : "PROJECTS";
    var nowTitle = document.getElementById("nowTitle");
    if (nowTitle) nowTitle.textContent = project.title;
    var nowYear = document.getElementById("nowYear");
    if (nowYear) nowYear.textContent = project.year;
    var counterEl = document.getElementById("infoCounter");
    if (counterEl) counterEl.textContent = isProfile ? "PROFILE / 00 · 个人档案" : "FEATURE " + pad(number) + " / " + totalLabel;
    var titleEl = document.getElementById("infoTitle");
    if (titleEl) titleEl.textContent = project.title;
    var taglineEl = document.getElementById("infoTagline");
    if (taglineEl) taglineEl.textContent = project.tagline;
    var summaryEl = document.getElementById("infoSummary");
    if (summaryEl) summaryEl.textContent = project.summary;
    var chipsEl = document.getElementById("infoChips");
    if (chipsEl) {
      chipsEl.innerHTML = "";
      var chips = [];
      if (isProfile) {
        ((project.stack && project.stack[0] && project.stack[0].items) || []).forEach(function (label) {
          if (label) chips.push(label);
        });
      } else {
        (project.stack || []).forEach(function (group) {
          if (group.items && group.items[0]) chips.push(group.items[0]);
        });
      }
      chips = chips.slice(0, 3);
      chips.forEach(function (label) {
        var li = document.createElement("li");
        li.textContent = label;
        chipsEl.appendChild(li);
      });
    }
    var factsEl = document.getElementById("profileFacts");
    if (factsEl) {
      if (isProfile) {
        factsEl.hidden = false;
        factsEl.innerHTML = profileFactsMarkup(project.facts, "profile-fact");
      } else {
        factsEl.hidden = true;
        factsEl.innerHTML = "";
      }
    }
    if (info) info.classList.toggle("is-profile", isProfile);
    if (profileSheet) profileSheet.hidden = !isProfile;
    if (profileMore) profileMore.hidden = !isProfile;
    var cta = document.getElementById("openCase");
    if (cta) {
      if (isProfile) {
        cta.setAttribute("href", "#");
        cta.dataset.profile = "true";
        cta.setAttribute("aria-label", "查看五件作品");
        cta.innerHTML = 'VIEW WORKS <span>→</span>';
      } else {
        cta.setAttribute("href", "work/" + project.slug + ".html");
        cta.dataset.profile = "false";
        cta.removeAttribute("aria-label");
        cta.innerHTML = 'OPEN CASE <span>↗</span>';
      }
    }
    var hint = document.getElementById("screenHint");
    if (hint) hint.textContent = isProfile ? "CLICK / START" : (settings.clickScreen === "next" ? "CLICK / NEXT" : "CLICK / OPEN");
    var touchHint = document.getElementById("touchHint");
    if (touchHint) touchHint.textContent = isProfile ? "TAP / 进入作品" : "SWIPE / 滑动切换 · TAP / 点击进入";
    app.style.setProperty("--accent", project.accent);
    app.style.setProperty("--accent-soft", hexAlpha(project.accent, 0.18));
    app.style.setProperty("--accent-deep", project.accentDeep);
    screen.style.setProperty("--accent", project.accent);
    screen.style.setProperty("--accent-soft", hexAlpha(project.accent, 0.18));
    var theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", project.accentDeep);
    document.title = isProfile ? (site.title || (site.name || "JINYI") + " — Selected Works") : project.title + " — " + (site.name || "JINYI");
    screen.setAttribute("aria-label", isProfile
      ? "个人档案：JINYI，武汉理工大学大二在读，绩点 3.9。点击或按回车开始浏览作品。"
      : project.title + " — " + project.tagline + "。点击或按回车进入详情。");
    if (tabs) {
      Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (tab, i) {
        var active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
      });
    }
    if (cursorLabel) cursorLabel.textContent = isProfile ? "VIEW WORKS" : (settings.clickScreen === "next" ? "NEXT" : "OPEN CASE");
    if (window.PORTFOLIO_3D && window.PORTFOLIO_3D.ready) window.PORTFOLIO_3D.setAccent(project.accent);
  }

  function hexAlpha(hex, alpha) {
    var raw = String(hex || "").replace("#", "");
    if (raw.length !== 6) return "rgba(227,164,92," + alpha + ")";
    var r = parseInt(raw.slice(0, 2), 16);
    var g = parseInt(raw.slice(2, 4), 16);
    var b = parseInt(raw.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  /* ----------------------------------------------------------------- tabs */
  function buildTabs() {
    if (!tabs) return;
    items.forEach(function (project, index) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.dataset.index = String(index);
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-label", project.isProfile ? "查看个人档案" : "查看 " + project.title);
      tab.innerHTML = '<span class="tab-num">' + pad(numberFor(index)) + "</span>" +
        '<span class="tab-title">' + esc(project.isProfile ? "关于" : project.title) + "</span>";
      tab.addEventListener("click", function () { select(index); });
      tabs.appendChild(tab);
    });
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "个人档案与作品切换");
  }

  /* ---------------------------------------------------------------- bulbs */
  function buildBulbs() {
    if (!bulbs) return;
    var positions = [];
    var i;
    for (i = 0; i < 9; i += 1) positions.push([2 + i * 12, 0]);
    for (i = 0; i < 9; i += 1) positions.push([98 - i * 12, 100]);
    for (i = 0; i < 4; i += 1) positions.push([0, 12 + i * 24]);
    for (i = 0; i < 4; i += 1) positions.push([100, 12 + i * 24]);
    positions.forEach(function (pos, index) {
      var bulb = document.createElement("span");
      bulb.className = "bulb";
      bulb.style.left = pos[0] + "%";
      bulb.style.top = pos[1] + "%";
      bulb.style.setProperty("--i", String(index));
      bulbs.appendChild(bulb);
    });
  }

  /* -------------------------------------------------------------- transition */
  function select(next, options) {
    options = options || {};
    next = ((Number(next) % total) + total) % total;
    if (!Number.isFinite(next)) return;
    if (next === state.index && !options.force) return;
    if (state.transitioning) { state.pending = next; return; }
    if (!state.ready) return;

    var project = items[next];
    var current = layers[state.activeLayer];
    var target = layers[1 - state.activeLayer];
    var mode = settings.transition && settings.transition.mode || "roll";
    var duration = settings.transition && Number(settings.transition.duration) || 720;
    if (["roll", "wipe", "fade"].indexOf(mode) < 0) mode = "roll";
    if (reduceMotion.matches) { mode = "fade"; duration = 120; }
    duration = Math.max(120, Math.min(1600, duration));

    state.transitioning = true;
    buildPoster(target, project, next);
    target.classList.add("is-visible");
    target.classList.remove("is-entering", "is-leaving");
    current.classList.add("is-visible");
    current.classList.remove("is-entering", "is-leaving");
    void target.offsetWidth;

    screen.dataset.transition = mode;
    screen.style.setProperty("--dur", duration + "ms");
    screen.classList.add("is-transitioning");
    target.classList.add("is-entering");
    current.classList.add("is-leaving");
    if (bulbs) bulbs.classList.add("is-pulsing");

    state.index = next;
    updateUI(project, next);
    updateUrl(project);

    window.setTimeout(function () {
      target.classList.remove("is-entering");
      current.classList.remove("is-leaving");
      current.classList.remove("is-visible");
      target.classList.add("is-visible");
      target.setAttribute("aria-hidden", "false");
      current.setAttribute("aria-hidden", "true");
      state.activeLayer = 1 - state.activeLayer;
      state.transitioning = false;
      screen.classList.remove("is-transitioning");
      if (bulbs) bulbs.classList.remove("is-pulsing");
      if (state.pending !== null) {
        var queued = state.pending;
        state.pending = null;
        if (queued !== state.index) select(queued);
      }
    }, duration + 80);
  }

  function updateUrl(project) {
    try {
      var url = new URL(window.location.href);
      if (project.isProfile) url.searchParams.delete("work");
      else url.searchParams.set("work", project.slug);
      window.history.replaceState(null, "", url);
    } catch (error) { /* file:// history can be restricted */ }
  }

  function openCurrent() {
    var project = items[state.index];
    if (!project) return;
    if (project.isProfile) { select(1); return; }
    window.location.assign("work/" + project.slug + ".html");
  }

  function screenAction() {
    if (state.transitioning) return;
    if (items[state.index] && items[state.index].isProfile) { select(1); return; }
    if (settings.clickScreen === "next") select(state.index + 1);
    else openCurrent();
  }

  /* ---------------------------------------------------------------- parallax */
  function onPointerMove(event) {
    if (!finePointer.matches) return;
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    if (raf) return;
    raf = window.requestAnimationFrame(function () {
      if (scene) {
        scene.style.setProperty("--mx", pointer.x.toFixed(3));
        scene.style.setProperty("--my", pointer.y.toFixed(3));
      }
      raf = null;
    });
    if (cursorLabel && cursorLabel.classList.contains("is-visible")) {
      cursorLabel.style.left = event.clientX + "px";
      cursorLabel.style.top = event.clientY + "px";
    }
  }

  /* ------------------------------------------------------------------ drag */
  function onPointerDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest("a, button")) return;
    state.drag = { x: event.clientX, y: event.clientY, dx: 0, moved: false, id: event.pointerId };
    if (billboard.setPointerCapture) {
      try { billboard.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    }
    if (cursorLabel) cursorLabel.classList.remove("is-visible");
  }
  function onPointerMoveDrag(event) {
    if (!state.drag) return;
    state.drag.dx = event.clientX - state.drag.x;
    if (Math.abs(state.drag.dx) > 7) state.drag.moved = true;
    if (state.drag.moved) {
      screen.style.transform = "translateX(" + Math.max(-12, Math.min(12, state.drag.dx * 0.035)) + "px)";
    }
  }
  function onPointerUp(event) {
    if (!state.drag) return;
    var drag = state.drag;
    state.drag = null;
    screen.style.transform = "";
    if (drag.moved && Math.abs(drag.dx) > 38) {
      state.suppressClick = true;
      select(state.index + (drag.dx < 0 ? 1 : -1));
      window.setTimeout(function () { state.suppressClick = false; }, 60);
    }
    if (billboard.releasePointerCapture) {
      try { billboard.releasePointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    }
  }
  function onPointerCancel() {
    state.drag = null;
    screen.style.transform = "";
  }

  /* ------------------------------------------------------------------ setup */
  function hideLoader() {
    if (loader) loader.classList.add("is-hidden");
    state.ready = true;
    app.dataset.ready = "true";
  }

  function renderFallback() {
    app.classList.add("is-fallback");
    hideLoader();
    if (!fallbackGrid) return;
    fallbackGrid.innerHTML = "";
    if (profileItem) {
      var profileCard = document.createElement("article");
      profileCard.className = "work-card profile-card";
      profileCard.innerHTML =
        '<div class="profile-card-head"><span>PROFILE / 00</span><span>WUHAN, CN · ' + esc(profileItem.year) + "</span></div>" +
        '<h2>' + esc(profileItem.title) + "</h2>" +
        '<p class="profile-card-tagline">' + esc(profileItem.tagline) + "</p>" +
        '<div class="profile-facts profile-facts--fallback">' + profileFactsMarkup(profileItem.facts, "profile-fact") + "</div>" +
        '<div class="profile-card-bio">' + (profileItem.bio || []).map(function (paragraph) {
          return "<p>" + esc(paragraph) + "</p>";
        }).join("") + "</div>" +
        '<p class="profile-card-note">' + esc(profileItem.profileNote || profileItem.summary) + "</p>";
      fallbackGrid.appendChild(profileCard);
    }
    projects.forEach(function (project, index) {
      var card = document.createElement("a");
      card.className = "work-card";
      card.href = "work/" + project.slug + ".html";
      card.innerHTML =
        '<figure><img src="' + esc(project.cover) + '" alt="' + esc(project.title) + '" loading="' + (index < 2 ? "eager" : "lazy") + '">' +
        '<span class="work-card-index">' + pad(index + 1) + " / " + totalLabel + "</span></figure>" +
        '<div class="work-card-body"><span>' + esc(project.type) + "</span>" +
        "<h2>" + esc(project.title) + "</h2><p>" + esc(project.summary) + "</p></div>";
      fallbackGrid.appendChild(card);
    });
  }

  function boot() {
    state.index = initialIndex();
    buildTabs();
    buildBulbs();
    buildProfileDossier();
    var first = items[state.index];
    buildPoster(layers[0], first, state.index);
    layers[0].classList.add("is-visible");
    layers[0].setAttribute("aria-hidden", "false");
    layers[1].classList.remove("is-visible");
    layers[1].setAttribute("aria-hidden", "true");
    updateUI(first, state.index);
    updateUrl(first);
    hideLoader();

    window.setTimeout(function () {
      projects.forEach(function (project, index) {
        if (index === state.index) return;
        if ("requestIdleCallback" in window) window.requestIdleCallback(function () { preload(project); }, { timeout: 2500 });
        else preload(project);
      });
    }, 900);
  }

  function setup() {
    var fallback = false;
    try {
      var params = new URLSearchParams(window.location.search);
      fallback = params.get("nowebgl") === "1" || params.get("fallback") === "1";
    } catch (error) { /* ignore */ }
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports("transform-style", "preserve-3d")) fallback = true;
    if (fallback) { renderFallback(); return; }

    var first = items[initialIndex()];
    Promise.race([
      preload(first),
      new Promise(function (resolve) { window.setTimeout(resolve, 1400); })
    ]).then(boot);

    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    billboard.addEventListener("pointerdown", onPointerDown);
    billboard.addEventListener("pointermove", onPointerMoveDrag, { passive: true });
    billboard.addEventListener("pointerup", onPointerUp);
    billboard.addEventListener("pointercancel", onPointerCancel);
    billboard.addEventListener("pointerenter", function (event) {
      if (!finePointer.matches) return;
      if (cursorLabel) {
        cursorLabel.classList.add("is-visible");
        cursorLabel.style.left = event.clientX + "px";
        cursorLabel.style.top = event.clientY + "px";
      }
    });
    billboard.addEventListener("pointerleave", function () {
      if (cursorLabel) cursorLabel.classList.remove("is-visible");
    });
    billboard.addEventListener("click", function (event) {
      if (event.target.closest("a, button")) return;
      if (state.suppressClick) { state.suppressClick = false; return; }
      screenAction();
    });
    var prev = document.getElementById("prevWork");
    var next = document.getElementById("nextWork");
    if (prev) prev.addEventListener("click", function () { select(state.index - 1); });
    if (next) next.addEventListener("click", function () { select(state.index + 1); });
    var openCase = document.getElementById("openCase");
    if (openCase) openCase.addEventListener("click", function (event) {
      if (openCase.dataset.profile === "true") {
        event.preventDefault();
        select(1);
      }
    });

    stage.addEventListener("wheel", function (event) {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) < 8 && Math.abs(event.deltaX) < 8) return;
      event.preventDefault();
      var now = Date.now();
      if (now - state.lastWheel < 520) return;
      state.lastWheel = now;
      var step = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      select(state.index + (step > 0 ? 1 : -1));
    }, { passive: false });

    document.addEventListener("keydown", function (event) {
      var tag = event.target && event.target.tagName;
      if (tag && /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault(); select(state.index + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault(); select(state.index - 1);
      } else if (event.key === "Home") {
        event.preventDefault(); select(0);
      } else if (event.key === "End") {
        event.preventDefault(); select(total - 1);
      } else if ((event.key === "Enter" || event.key === " ") && document.activeElement === screen) {
        event.preventDefault(); screenAction();
      } else if (/^[0-9]$/.test(event.key)) {
        var keyNumber = Number(event.key);
        var n = profileItem ? keyNumber : keyNumber - 1;
        if (n >= 0 && n < total) { event.preventDefault(); select(n); }
      }
    });

    window.addEventListener("popstate", function () {
      var urlIndex = indexFromUrl();
      if (urlIndex >= 0 && urlIndex !== state.index) select(urlIndex);
      else if (urlIndex < 0 && profileItem && state.index !== 0) select(0);
    });

    document.addEventListener("visibilitychange", function () {
      app.classList.toggle("is-paused", document.hidden);
    });

    window.__portfolio = {
      select: select,
      getState: function () {
        return {
          index: state.index,
          slug: items[state.index].slug,
          total: total,
          works: worksTotal,
          profile: !!items[state.index].isProfile,
          transition: screen.dataset.transition || null,
          transitioning: state.transitioning,
          fallback: app.classList.contains("is-fallback"),
          webgl: !!(window.PORTFOLIO_3D && window.PORTFOLIO_3D.ready)
        };
      },
      screenPoint: function () {
        var rect = screen.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
      }
    };

    if (window.PORTFOLIO_3D && !app.classList.contains("is-fallback")) {
      try {
        var engine = window.PORTFOLIO_3D.init({
          stage: stage,
          scene: scene,
          reduceMotion: reduceMotion,
          finePointer: finePointer,
          accent: items[state.index].accent
        });
        if (engine && engine.ready) {
          var sideNote = document.getElementById("sideNote");
          if (sideNote) sideNote.textContent = "THREE.JS / WEBGL · SCROLL / DRAG / ARROWS";
          engine.setAccent(items[state.index].accent);
        }
      } catch (error) {
        if (window.console && console.warn) console.warn("3D scene skipped:", error);
      }
    }
  }

  setup();
})();
