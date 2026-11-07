/* JINYI — Three.js environment for the drive-in.
   The CSS billboard and all UI stay in the DOM; this file only builds the
   low-poly world behind it. It is a classic script so file:// keeps working. */
(function () {
  "use strict";

  var api = { ready: false, error: null };
  window.PORTFOLIO_3D = api;

  var THREE = window.THREE;
  if (!THREE) {
    api.error = "three.js not loaded";
    return;
  }

  var state = {
    started: false,
    renderer: null,
    scene: null,
    camera: null,
    stage: null,
    car: null,
    dust: null,
    lampGlows: [],
    lampLights: [],
    accentLight: null,
    headLight: null,
    pointer: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    reduceMotion: false,
    frame: 0,
    last: 0,
    seed: 19
  };

  function rand() {
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    return state.seed / 4294967296;
  }

  function pick(arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function hasWebGL() {
    try {
      var canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch (error) {
      return false;
    }
  }

  function radialTexture(inner, outer, stops) {
    var size = 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, inner);
    if (stops) {
      for (var i = 0; i < stops.length; i += 1) gradient.addColorStop(stops[i][0], stops[i][1]);
    }
    gradient.addColorStop(1, outer);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  function groundTexture() {
    var size = 1024;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    var bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, "#17120f");
    bg.addColorStop(0.35, "#100d0c");
    bg.addColorStop(1, "#070606");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    for (var i = 0; i < 4200; i += 1) {
      var shade = 22 + Math.floor(rand() * 30);
      ctx.fillStyle = "rgba(" + shade + "," + (shade - 3) + "," + (shade - 5) + "," + (0.08 + rand() * 0.14) + ")";
      ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2.4, 1 + rand() * 1.8);
    }

    ctx.strokeStyle = "rgba(236, 190, 133, .20)";
    ctx.lineWidth = 5;
    ctx.setLineDash([45, 58]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(236, 190, 133, .10)";
    ctx.lineWidth = 3;
    [size * 0.28, size * 0.72].forEach(function (x) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    });

    var glow = ctx.createRadialGradient(size * 0.52, size * 0.42, 10, size * 0.52, size * 0.42, size * 0.55);
    glow.addColorStop(0, "rgba(255, 199, 132, .26)");
    glow.addColorStop(0.45, "rgba(255, 173, 97, .08)");
    glow.addColorStop(1, "rgba(255, 173, 97, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }

  function material(color, options) {
    var opts = options || {};
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: opts.roughness == null ? 0.82 : opts.roughness,
      metalness: opts.metalness == null ? 0.12 : opts.metalness,
      flatShading: opts.flatShading !== false
    });
  }

  function addCity(scene) {
    var count = 42;
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var city = new THREE.InstancedMesh(geometry, material(0x0b0b12, { roughness: 0.96, metalness: 0.04 }), count);
    var dummy = new THREE.Object3D();
    var windows = [];

    for (var i = 0; i < count; i += 1) {
      var width = 0.8 + rand() * 2.8;
      var height = 1.8 + rand() * 8.8;
      var depth = 0.9 + rand() * 2.2;
      var x = (rand() * 2 - 1) * 25;
      var z = -14 - rand() * 13;
      dummy.position.set(x, height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.updateMatrix();
      city.setMatrixAt(i, dummy.matrix);
      var shade = 0.035 + rand() * 0.05;
      city.setColorAt(i, new THREE.Color().setRGB(shade, shade * 0.92, shade * 1.2));

      if (i % 2 === 0) {
        var columns = 2 + Math.floor(rand() * 3);
        for (var w = 0; w < columns; w += 1) {
          windows.push({
            x: x - width * 0.34 + (width * 0.68 / Math.max(1, columns - 1)) * w,
            y: height * (0.2 + rand() * 0.65),
            z: z + depth / 2 + 0.021
          });
        }
      }
    }
    city.instanceMatrix.needsUpdate = true;
    if (city.instanceColor) city.instanceColor.needsUpdate = true;
    scene.add(city);

    var positions = new Float32Array(windows.length * 3);
    for (var j = 0; j < windows.length; j += 1) {
      positions[j * 3] = windows[j].x;
      positions[j * 3 + 1] = windows[j].y;
      positions[j * 3 + 2] = windows[j].z;
    }
    var lightGeometry = new THREE.BufferGeometry();
    lightGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var lightMaterial = new THREE.PointsMaterial({
      color: 0xffd3a0,
      size: 0.07,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(lightGeometry, lightMaterial));
  }

  function addLamp(scene, x, z, height) {
    var group = new THREE.Group();
    var metal = material(0x111216, { roughness: 0.6, metalness: 0.55 });
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, height, 6), metal);
    pole.position.y = height / 2;
    group.add(pole);

    var arm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 1.15), metal);
    arm.position.set(0, height - 0.1, 0.48);
    group.add(arm);

    var head = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffd49a })
    );
    head.position.set(0, height - 0.16, 1.02);
    group.add(head);

    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture("rgba(255, 220, 166, .95)", "rgba(255, 190, 110, 0)", [[0.18, "rgba(255, 214, 157, .6)"], [0.52, "rgba(255, 185, 111, .13)"]]),
      color: 0xffcf96,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    glow.position.set(0, height - 0.16, 1.02);
    glow.scale.set(3.4, 3.4, 1);
    group.add(glow);
    state.lampGlows.push(glow);

    var light = new THREE.PointLight(0xffc98d, 1.5, 14, 2);
    light.position.set(0, height - 0.3, 0.9);
    group.add(light);
    state.lampLights.push(light);

    group.position.set(x, 0, z);
    scene.add(group);
  }

  function addCar(scene) {
    var car = new THREE.Group();
    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b3448,
      roughness: 0.3,
      metalness: 0.76,
      flatShading: true,
      emissive: 0x0b1420,
      emissiveIntensity: 0.8
    });
    var trimMaterial = material(0x090b10, { roughness: 0.45, metalness: 0.55 });
    var glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x274357,
      roughness: 0.14,
      metalness: 0.84,
      flatShading: true
    });
    var rubber = material(0x070708, { roughness: 0.98, metalness: 0.02 });
    var rim = material(0x5c5f66, { roughness: 0.35, metalness: 0.8 });

    var body = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.52, 1.28), bodyMaterial);
    body.position.y = 0.58;
    car.add(body);

    var hood = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.2, 1.2), bodyMaterial);
    hood.position.set(0.95, 0.86, 0);
    car.add(hood);

    var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 1.02), glassMaterial);
    cabin.position.set(-0.08, 1.05, 0);
    car.add(cabin);

    var roof = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.1, 1.06), bodyMaterial);
    roof.position.set(-0.1, 1.35, 0);
    car.add(roof);

    var bumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.32), trimMaterial);
    bumper.position.set(1.4, 0.5, 0);
    car.add(bumper);

    var rearBumper = bumper.clone();
    rearBumper.position.x = -1.4;
    car.add(rearBumper);

    [-0.86, 0.86].forEach(function (x) {
      [-0.66, 0.66].forEach(function (z) {
        var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.28, 14), rubber);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.34, z);
        car.add(wheel);
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.295, 10), rim);
        cap.rotation.z = Math.PI / 2;
        cap.position.set(x, 0.34, z);
        car.add(cap);
      });
    });

    var headMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0ae });
    var headGlowTexture = radialTexture("rgba(255, 235, 190, .95)", "rgba(255, 196, 118, 0)", [[0.45, "rgba(255, 215, 150, .3)"]]);
    [-0.4, 0.4].forEach(function (z) {
      var head = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.25), headMaterial);
      head.position.set(1.4, 0.68, z);
      car.add(head);
      var headGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: headGlowTexture,
        color: 0xffdba8,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      }));
      headGlow.position.set(1.52, 0.68, z);
      headGlow.scale.set(0.7, 0.7, 1);
      car.add(headGlow);
    });
    var tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff4b38 });
    [-0.4, 0.4].forEach(function (z) {
      var tail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.22), tailMaterial);
      tail.position.set(-1.4, 0.68, z);
      car.add(tail);
    });

    var headLight = new THREE.PointLight(0xffd6a0, 1.4, 6, 2);
    headLight.position.set(1.7, 0.68, 0);
    car.add(headLight);
    state.headLight = headLight;

    var shadowTexture = radialTexture("rgba(0, 0, 0, .72)", "rgba(0, 0, 0, 0)", [[0.5, "rgba(0, 0, 0, .35)"]]);
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.9),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.016;
    car.add(shadow);

    var rimLight = new THREE.PointLight(0xffd1a0, 1.3, 5, 2);
    rimLight.position.set(0, 2.2, 0.9);
    car.add(rimLight);

    car.position.set(2.25, 0, 0.8);
    car.rotation.y = -1.18;
    car.scale.setScalar(0.7);
    if (window.matchMedia && window.matchMedia("(max-width: 620px)").matches) car.visible = false;
    state.car = car;
    scene.add(car);

    var carWash = new THREE.PointLight(0xffd2a0, 2.1, 9, 2);
    carWash.position.set(2.2, 3.1, 2.1);
    state.scene.add(carWash);
  }

  function addProps(scene) {
    var wood = material(0x3a271c, { roughness: 0.9, metalness: 0.05 });
    var cable = material(0x14100d, { roughness: 1, metalness: 0 });
    var spool = new THREE.Group();
    var spoolFace = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 12), wood);
    spoolFace.rotation.z = Math.PI / 2;
    spool.add(spoolFace);
    var spoolCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 12), cable);
    spoolCore.rotation.z = Math.PI / 2;
    spool.add(spoolCore);
    spool.position.set(-3.5, 0.62, 3.7);
    scene.add(spool);

    var coneMaterial = material(0xd4682f, { roughness: 0.8 });
    var stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d8b5 });
    [-4.4, -5.2, -6.1].forEach(function (x, i) {
      var cone = new THREE.Group();
      var body = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.62, 8), coneMaterial);
      body.position.y = 0.31;
      cone.add(body);
      var stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.16, 0.09, 8), stripeMaterial);
      stripe.position.y = 0.35;
      cone.add(stripe);
      cone.position.set(x, 0, 2.2 + i * 0.6);
      scene.add(cone);
    });
  }

  function addDust(scene) {
    var count = 220;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() * 2 - 1) * 22;
      positions[i * 3 + 1] = 0.4 + rand() * 7;
      positions[i * 3 + 2] = -18 + rand() * 24;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var points = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0xffd6a1,
      size: 0.042,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    }));
    state.dust = points;
    scene.add(points);
  }

  function resize() {
    if (!state.renderer || !state.stage) return;
    var width = state.stage.clientWidth || window.innerWidth;
    var height = state.stage.clientHeight || window.innerHeight;
    if (!width || !height) return;
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height, false);
  }

  function renderFrame(now) {
    state.frame = 0;
    if (!state.renderer || document.hidden) return;
    var t = (now || 0) / 1000;
    var delta = state.last ? Math.min(0.05, t - state.last) : 0.016;
    state.last = t;

    state.target.x = state.pointer.x * 0.42;
    state.target.y = state.pointer.y * 0.18;
    state.camera.position.x += (state.target.x - state.camera.position.x) * 0.045;
    state.camera.position.y += (2.8 + state.target.y - state.camera.position.y) * 0.045;
    state.camera.lookAt(0, 2.2, -3);

    if (state.car) {
      state.car.position.y = Math.sin(t * 1.1) * 0.012;
      state.car.rotation.z = Math.sin(t * 0.7) * 0.0025;
    }
    if (state.dust) state.dust.rotation.y += delta * 0.008;
    for (var i = 0; i < state.lampGlows.length; i += 1) {
      state.lampGlows[i].material.opacity = 0.55 + Math.sin(t * 1.3 + i * 1.7) * 0.08;
    }
    if (state.headLight) state.headLight.intensity = 1.2 + Math.sin(t * 2.1) * 0.12;
    state.renderer.render(state.scene, state.camera);

    if (!state.reduceMotion) state.frame = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (state.frame || state.reduceMotion) return;
    state.last = 0;
    state.frame = requestAnimationFrame(renderFrame);
  }

  function onVisibility() {
    if (document.hidden) {
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
    } else {
      start();
    }
  }

  api.init = function (options) {
    if (state.started) return api;
    state.started = true;
    var opts = options || {};
    state.stage = opts.stage || document.getElementById("stage");
    state.reduceMotion = !!(opts.reduceMotion && opts.reduceMotion.matches);
    if (!state.stage || !hasWebGL()) {
      api.error = "webgl unavailable";
      return api;
    }
    if (/[?&](nowebgl|fallback)=1/.test(window.location.search)) {
      api.error = "disabled by query";
      return api;
    }

    var canvas = document.getElementById("webgl");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "webgl";
      canvas.className = "webgl-scene";
      canvas.setAttribute("aria-hidden", "true");
      var sceneHost = document.getElementById("scene");
      if (sceneHost) sceneHost.insertBefore(canvas, sceneHost.firstChild);
    }

    try {
      state.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (error) {
      api.error = String(error && error.message || error);
      return api;
    }

    state.renderer.setClearColor(0x000000, 0);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.75));
    state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.08;

    state.scene = new THREE.Scene();
    state.scene.fog = new THREE.FogExp2(0x09070d, 0.027);
    state.camera = new THREE.PerspectiveCamera(43, 1, 0.1, 90);
    state.camera.position.set(0, 2.8, 8.7);

    var hemi = new THREE.HemisphereLight(0x6f6a8f, 0x0a0806, 0.95);
    state.scene.add(hemi);
    var key = new THREE.DirectionalLight(0xffbd83, 1.05);
    key.position.set(4.5, 7, 2.5);
    state.scene.add(key);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ map: groundTexture(), color: 0x8a7a6a, roughness: 0.95, metalness: 0.06 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, -8);
    state.scene.add(ground);

    var pool = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 18),
      new THREE.MeshBasicMaterial({
        map: radialTexture("rgba(255, 205, 143, .36)", "rgba(255, 205, 143, 0)", [[0.45, "rgba(255, 190, 110, .13)"]]),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.025, -1.5);
    state.scene.add(pool);

    var laneMaterial = new THREE.MeshBasicMaterial({
      color: 0xe6b57c,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    [-3.2, 3.2].forEach(function (x) {
      var edge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 12), laneMaterial);
      edge.position.set(x, 0.018, -1.5);
      state.scene.add(edge);
    });
    for (var l = 0; l < 7; l += 1) {
      var dash = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.008, 0.72), laneMaterial);
      dash.position.set(0, 0.019, -7.2 + l * 1.85);
      state.scene.add(dash);
    }

    [-9.2, 9.4].forEach(function (x, index) {
      var lampLight = new THREE.PointLight(0xffc98d, 1.6, 16, 2);
      lampLight.position.set(x, 4.6, -4.2 - index * 0.8);
      state.scene.add(lampLight);
      state.lampLights.push(lampLight);
    });
    addCar(state.scene);
    if (window.matchMedia("(max-width: 620px)").matches && state.car) state.car.visible = false;
    addProps(state.scene);
    addDust(state.scene);

    state.accentLight = new THREE.PointLight(0xe3a45c, 2.2, 16, 2);
    state.accentLight.position.set(2.5, 3.1, -0.8);
    state.scene.add(state.accentLight);

    resize();
    api.ready = true;
    document.body.classList.add("has-webgl");

    window.addEventListener("resize", resize, { passive: true });
    if (window.ResizeObserver) {
      state.resizeObserver = new ResizeObserver(resize);
      state.resizeObserver.observe(state.stage);
    }
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", function (event) {
      event.preventDefault();
      api.ready = false;
      api.error = "context lost";
      document.body.classList.remove("has-webgl");
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
    });

    if (!state.reduceMotion) {
      document.addEventListener("pointermove", function (event) {
        if (!opts.finePointer || !opts.finePointer.matches) return;
        state.pointer.x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 1.4;
        state.pointer.y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 1.4;
      }, { passive: true });
    }

    api.setAccent(opts.accent || "#e3a45c");
    renderFrame(performance.now());
    if (!state.reduceMotion) start();
    return api;
  };

  api.setAccent = function (hex) {
    if (!state.accentLight || !hex) return;
    try {
      state.accentLight.color.set(hex);
    } catch (error) { /* keep the default */ }
  };

  api.getInfo = function () {
    return {
      ready: api.ready,
      error: api.error,
      calls: state.renderer ? state.renderer.info.render.calls : 0,
      triangles: state.renderer ? state.renderer.info.render.triangles : 0,
      pixelRatio: state.renderer ? state.renderer.getPixelRatio() : 0,
      objects: state.scene ? state.scene.children.length : 0
    };
  };

  api.dispose = function () {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (state.resizeObserver) state.resizeObserver.disconnect();
    if (state.renderer) state.renderer.dispose();
    api.ready = false;
    document.body.classList.remove("has-webgl");
  };
})();
