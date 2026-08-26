/* ============================================================================
   Special's Restro & Cafe — WebGL hero (three.js r136 UMD, global THREE)
   ----------------------------------------------------------------------------
   A real 3D scene: lathed ceramic cup + saucer, latte-art surface, rising
   steam, orbiting coffee beans, mouse parallax and scroll-driven camera.

   Degrades safely: if THREE is missing, WebGL is unavailable, or the user
   prefers reduced motion, init() returns null and the CSS hero stays as-is.

   API:  const hero = SRC.Hero3D.init(canvas)
         hero.setScroll(0..1)   hero.pulse()   hero.destroy()
   ========================================================================== */
window.SRC = window.SRC || {};

SRC.Hero3D = (function () {
  'use strict';

  /* -------------------------------------------------- canvas-made textures */
  function latteArtTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d'), C = 256;

    const g = x.createRadialGradient(200, 180, 20, C, C, 256);
    g.addColorStop(0, '#6d4126');
    g.addColorStop(0.45, '#4a2716');
    g.addColorStop(1, '#24120a');
    x.fillStyle = g;
    x.beginPath(); x.arc(C, C, 256, 0, 6.283); x.fill();

    /* rosetta */
    x.strokeStyle = 'rgba(255,240,218,.95)';
    x.lineCap = 'round';
    x.beginPath(); x.moveTo(C, 60); x.lineTo(C, 452); x.lineWidth = 22; x.stroke();
    for (let i = 0; i < 8; i++) {
      const y = 110 + i * 42, w = 150 - i * 15;
      x.lineWidth = 18;
      x.beginPath(); x.moveTo(C, y); x.quadraticCurveTo(C - w, y + 14, C - w + 34, y + 52); x.stroke();
      x.beginPath(); x.moveTo(C, y); x.quadraticCurveTo(C + w, y + 14, C + w - 34, y + 52); x.stroke();
    }
    x.fillStyle = 'rgba(255,244,226,.95)';
    x.beginPath(); x.arc(C, 84, 40, 0, 6.283); x.fill();

    /* crema micro-bubbles around the rim */
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * 6.283, r = 190 + Math.random() * 58;
      x.fillStyle = 'rgba(255,226,190,' + (0.1 + Math.random() * 0.3) + ')';
      x.beginPath(); x.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, 1 + Math.random() * 4, 0, 6.283); x.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    if ('encoding' in tex && THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function beanTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#7c4a29'); g.addColorStop(0.5, '#4e2a16'); g.addColorStop(1, '#2a1509');
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(20,10,4,.85)'; x.lineWidth = 12; x.lineCap = 'round';
    x.beginPath(); x.moveTo(18, 64); x.quadraticCurveTo(128, 34, 238, 64); x.stroke();
    const t = new THREE.CanvasTexture(c);
    if ('encoding' in t && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function softDotTexture(THREE, inner) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner || 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,236,208,.55)');
    g.addColorStop(1, 'rgba(255,220,180,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function shadowTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,.72)');
    g.addColorStop(0.55, 'rgba(0,0,0,.30)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  /* ----------------------------------------------------------------- init */
  function init(canvas) {
    const THREE = window.THREE;
    if (!canvas || !THREE || !THREE.WebGLRenderer) return null;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; }
    if ('physicallyCorrectLights' in renderer) renderer.physicallyCorrectLights = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x120b07, 0.055);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 2.0, 6.4);

    /* ---------------------------------------------------------- lighting */
    scene.add(new THREE.AmbientLight(0x53381f, 1.0));
    const key = new THREE.DirectionalLight(0xfff0d8, 2.1);
    key.position.set(3.4, 5.2, 3.0);
    scene.add(key);
    const rimA = new THREE.PointLight(0xffa93d, 26, 16, 2);
    rimA.position.set(-3.6, 1.6, -2.2);
    scene.add(rimA);
    const rimB = new THREE.PointLight(0xff6b3f, 14, 14, 2);
    rimB.position.set(3.4, 0.6, -3.0);
    scene.add(rimB);
    const fill = new THREE.PointLight(0x8fd8ff, 6, 14, 2);
    fill.position.set(-1.2, 3.0, 4.2);
    scene.add(fill);

    /* -------------------------------------------------------- the objects */
    const world = new THREE.Group();
    scene.add(world);

    const V2 = THREE.Vector2;
    const ceramic = new THREE.MeshPhysicalMaterial({
      color: 0xf8f1e7, roughness: 0.3, metalness: 0.0, clearcoat: 0.85,
      clearcoatRoughness: 0.22, side: THREE.DoubleSide
    });

    const cupPts = [
      [0.00, 0.02], [0.60, 0.02], [0.65, 0.07], [0.60, 0.12], [0.69, 0.32],
      [0.85, 0.72], [0.97, 1.16], [1.02, 1.34], [1.04, 1.40],
      [0.99, 1.40], [0.96, 1.33], [0.83, 0.88], [0.67, 0.38], [0.58, 0.17], [0.00, 0.15]
    ].map(p => new V2(p[0], p[1]));

    const cup = new THREE.Mesh(new THREE.LatheGeometry(cupPts, 72), ceramic);
    cup.geometry.computeVertexNormals();

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.078, 18, 44, Math.PI * 1.32),
      ceramic
    );
    handle.position.set(1.02, 0.82, 0);
    handle.rotation.z = -0.45;

    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.94, 72),
      new THREE.MeshPhysicalMaterial({
        map: latteArtTexture(THREE), roughness: 0.16, metalness: 0.0,
        clearcoat: 1.0, clearcoatRoughness: 0.08
      })
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 1.315;

    const saucerPts = [
      [0.00, 0.00], [1.48, 0.00], [1.86, 0.15], [1.92, 0.21],
      [1.83, 0.21], [1.68, 0.13], [0.52, 0.085], [0.00, 0.075]
    ].map(p => new V2(p[0], p[1]));
    const saucer = new THREE.Mesh(new THREE.LatheGeometry(saucerPts, 72), ceramic);
    saucer.position.y = -0.02;

    const cupRig = new THREE.Group();
    cupRig.add(cup, handle, coffee);
    world.add(saucer, cupRig);

    /* soft contact shadow */
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 7.2),
      new THREE.MeshBasicMaterial({ map: shadowTexture(THREE), transparent: true, depthWrite: false, opacity: 0.85 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.035;
    world.add(shadow);

    /* orbiting beans */
    const beanMat = new THREE.MeshStandardMaterial({ map: beanTexture(THREE), roughness: 0.52, metalness: 0.05 });
    const beanGeo = new THREE.SphereGeometry(0.16, 22, 16);
    beanGeo.scale(1.0, 0.68, 0.6);
    const beans = [];
    const BEAN_N = 15;
    for (let i = 0; i < BEAN_N; i++) {
      const m = new THREE.Mesh(beanGeo, beanMat);
      const b = {
        mesh: m,
        a: (i / BEAN_N) * Math.PI * 2 + Math.random() * 0.5,
        r: 2.15 + Math.random() * 1.5,
        y: -0.1 + Math.random() * 2.9,
        sp: 0.11 + Math.random() * 0.2,
        bob: 0.1 + Math.random() * 0.28,
        ph: Math.random() * 6.283,
        spin: new THREE.Vector3(Math.random() * 0.9, Math.random() * 0.9, Math.random() * 0.9),
        push: 0
      };
      if (i % 2) b.sp *= -1;
      beans.push(b);
      world.add(m);
    }

    /* steam */
    const STEAM_N = 110;
    const spos = new Float32Array(STEAM_N * 3);
    const sdat = [];
    for (let i = 0; i < STEAM_N; i++) {
      const d = { x: (Math.random() - 0.5) * 1.1, y: 1.4 + Math.random() * 3.4, z: (Math.random() - 0.5) * 1.1, v: 0.16 + Math.random() * 0.3, ph: Math.random() * 6.283 };
      sdat.push(d);
      spos[i * 3] = d.x; spos[i * 3 + 1] = d.y; spos[i * 3 + 2] = d.z;
    }
    const steamGeo = new THREE.BufferGeometry();
    steamGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    const steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({
      size: 0.5, map: softDotTexture(THREE), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.42, sizeAttenuation: true, color: 0xffd9a8
    }));
    world.add(steam);

    /* background dust for depth */
    const DUST_N = 150;
    const dpos = new Float32Array(DUST_N * 3);
    for (let i = 0; i < DUST_N; i++) {
      dpos[i * 3] = (Math.random() - 0.5) * 18;
      dpos[i * 3 + 1] = Math.random() * 9 - 1.5;
      dpos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 0.11, map: softDotTexture(THREE, 'rgba(255,214,160,1)'), transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5, color: 0xffc98a
    }));
    scene.add(dust);

    /* ------------------------------------------------------------- state */
    const clock = new THREE.Clock();
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let scrollP = 0, pulseE = 0, running = true, visible = true, raf = 0, disposed = false;
    let baseY = -0.55;

    function onPointer(e) {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      target.x = (px - 0.5) * 2;
      target.y = (py - 0.5) * 2;
    }
    function onLeave() { target.x = 0; target.y = 0; }

    function resize() {
      const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);

      /* On wide screens the hero is a two-column layout, so the cup is parked
         low and right of centre — clear of the headline, tucked under the
         chef's-pick card. Narrow screens stack, so it centres and shrinks
         into a pure backdrop. */
      const narrow = w < 1024;
      camera.position.z = narrow ? 8.2 : 7.1;
      camera.updateProjectionMatrix();

      const halfH = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
      const halfW = halfH * camera.aspect;

      world.scale.setScalar(narrow ? 0.62 : 0.8);
      world.position.x = narrow ? 0 : halfW * 0.5;
      baseY = narrow ? -0.5 : -0.95;
    }

    function frame() {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!running || !visible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      cur.x += (target.x - cur.x) * 0.055;
      cur.y += (target.y - cur.y) * 0.055;
      pulseE *= 0.94;

      world.rotation.y = t * 0.12 + cur.x * 0.55;
      world.rotation.x = -cur.y * 0.16 + Math.sin(t * 0.5) * 0.014;
      world.position.y = baseY - scrollP * 0.9 + Math.sin(t * 0.9) * 0.03;
      cupRig.rotation.y = Math.sin(t * 0.35) * 0.05;
      cupRig.scale.setScalar(1 + pulseE * 0.06);

      camera.position.x = cur.x * 0.42;
      camera.position.y = 2.0 - cur.y * 0.34 + scrollP * 0.5;
      camera.lookAt(0, 0.75 - scrollP * 0.5, 0);

      /* beans */
      for (let i = 0; i < beans.length; i++) {
        const b = beans[i];
        b.a += b.sp * dt;
        b.push *= 0.93;
        const rad = b.r + b.push + pulseE * 1.1;
        b.mesh.position.set(Math.cos(b.a) * rad, b.y + Math.sin(t * 0.8 + b.ph) * b.bob, Math.sin(b.a) * rad);
        b.mesh.rotation.x += b.spin.x * dt;
        b.mesh.rotation.y += b.spin.y * dt;
        b.mesh.rotation.z += b.spin.z * dt;
      }

      /* steam */
      const arr = steamGeo.attributes.position.array;
      for (let i = 0; i < STEAM_N; i++) {
        const d = sdat[i];
        d.y += (d.v + pulseE * 1.6) * dt;
        if (d.y > 5.4) { d.y = 1.35; d.x = (Math.random() - 0.5) * 0.9; d.z = (Math.random() - 0.5) * 0.9; }
        const sway = (d.y - 1.35) * 0.16;
        arr[i * 3] = d.x + Math.sin(t * 0.9 + d.ph) * sway;
        arr[i * 3 + 1] = d.y;
        arr[i * 3 + 2] = d.z + Math.cos(t * 0.7 + d.ph) * sway;
      }
      steamGeo.attributes.position.needsUpdate = true;
      steam.material.opacity = 0.42 * (1 - scrollP * 0.7) + pulseE * 0.25;

      dust.rotation.y = t * 0.02;
      rimA.intensity = 26 + Math.sin(t * 1.7) * 3 + pulseE * 26;
      renderer.render(scene, camera);
    }

    /* --------------------------------------------------------- listeners */
    const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas.parentElement || canvas); else window.addEventListener('resize', resize);

    const io = ('IntersectionObserver' in window)
      ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.01 })
      : null;
    if (io) io.observe(canvas);

    function onVis() { running = !document.hidden; }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);

    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); running = false; });
    canvas.addEventListener('webglcontextrestored', function () { running = true; });

    resize();
    raf = requestAnimationFrame(frame);

    return {
      pulse: function (amount) {
        pulseE = Math.min(1.6, pulseE + (amount == null ? 0.85 : amount));
        beans.forEach(b => { b.push += 0.35 + Math.random() * 0.5; });
      },
      setScroll: function (p) { scrollP = Math.max(0, Math.min(1, p || 0)); },
      destroy: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onPointer);
        scene.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
          }
        });
        renderer.dispose();
      }
    };
  }

  return { init: init };
})();
