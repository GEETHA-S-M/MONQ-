/* ============================================================
   monq. — pour / dissolve loop

   A short looping scene: granules fall from an opened sachet into a
   cup and shrink away near the surface (standing in for dissolving),
   with a few soft rings pulsing on the liquid to sell the contact.
   Everything is driven by elapsed time mod CYCLE, so the loop is
   exact and stateless — no timers to reset, no drift.

   Lazy-loaded the same way as viewer3d.js: dynamic import triggered
   near the viewport, WebGL-gated, paused off-screen.
   ============================================================ */
import * as THREE from './vendor/three/three.module.min.js';

export function mount(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 1.05, 4.6);
  camera.lookAt(0, 0.15, 0);

  const key = new THREE.DirectionalLight(0xffe6bd, 2.6); key.position.set(2, 4, 3); scene.add(key);
  const fill = new THREE.DirectionalLight(0x8899bb, 0.5); fill.position.set(-3, -1, 2); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffdcb0, 0.55));

  /* ---- cup: a simple ceramic tapered cylinder, open-topped ---- */
  const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xece3d2, roughness: 0.4, metalness: 0.05, clearcoat: 0.3 });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.85, 1.5, 48, 1, true), cupMat);
  cup.material.side = THREE.DoubleSide;
  cup.position.y = -0.4;
  scene.add(cup);
  const base = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), cupMat);
  base.rotation.x = -Math.PI / 2; base.position.y = -1.15;
  scene.add(base);

  /* ---- liquid: dark espresso surface ---- */
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0x2c1a0e, roughness: 0.15, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.2
  });
  const liquid = new THREE.Mesh(new THREE.CircleGeometry(1.0, 64), liquidMat);
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.y = 0.28;
  scene.add(liquid);

  /* ---- ripples: a few teal rings, each pulsing on its own phase ---- */
  const ripples = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.09, 40),
      new THREE.MeshBasicMaterial({ color: 0x3e9188, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2; m.position.y = 0.285;
    m.userData.phase = i / 3;
    scene.add(m);
    return m;
  });

  /* ---- sachet: the real pack artwork, tilted as if mid-pour ---- */
  const loader = new THREE.TextureLoader();
  const packTex = loader.load('assets/img/pack-0.webp');
  packTex.colorSpace = THREE.SRGBColorSpace;
  const sachet = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 1.15),
    new THREE.MeshStandardMaterial({ map: packTex, transparent: true, roughness: 0.5, metalness: 0.2 })
  );
  sachet.position.set(-0.9, 1.9, 0.2);
  sachet.rotation.set(0, 0.3, -0.95);
  scene.add(sachet);

  /* ---- granules: instanced so 46 particles cost one draw call ---- */
  const N = 46;
  const geo = new THREE.SphereGeometry(0.028, 6, 6);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf3e6c8, roughness: 0.6, metalness: 0.1, transparent: true });
  const inst = new THREE.InstancedMesh(geo, mat, N);
  scene.add(inst);
  const seeds = Array.from({ length: N }, () => ({
    phase: Math.random(), dx: (Math.random() - 0.5) * 0.12, dz: (Math.random() - 0.5) * 0.4, spin: Math.random() * Math.PI * 2
  }));

  const CYCLE = 5.0;        // seconds — loops every 4-6s as spec'd
  const FALL_FRAC = 0.42;   // fraction of the cycle each granule spends actually falling
  const START_Y = 1.55, END_Y = 0.30;
  const dummy = new THREE.Object3D();

  function updateParticles(elapsed) {
    const cyc = (elapsed % CYCLE) / CYCLE;
    for (let i = 0; i < N; i++) {
      const s = seeds[i];
      let local = cyc - s.phase * 0.55;         // stagger starts across the pour window
      local = ((local % 1) + 1) % 1;
      const active = local < FALL_FRAC;
      const p = active ? local / FALL_FRAC : 1;
      const y = active ? THREE.MathUtils.lerp(START_Y, END_Y, p * p) : END_Y - 1;   // parked off-scene when idle
      const x = -0.85 + s.dx * 2 + p * 0.85 + Math.sin(p * 6 + s.spin) * 0.02;
      const z = s.dz * (0.4 + p * 0.6);
      dummy.position.set(x, y, z);
      const scale = active ? (1 - p * 0.7) : 0;  // shrinks near the surface — reads as dissolving
      dummy.scale.setScalar(Math.max(0.001, scale));
      dummy.rotation.set(s.spin + p * 4, s.spin, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  }

  function updateRipples(elapsed) {
    ripples.forEach((r) => {
      const local = (elapsed / CYCLE * 1.6 + r.userData.phase) % 1;
      r.scale.setScalar(0.15 + local * 1.3);
      r.material.opacity = Math.max(0, 0.5 * (1 - local));
    });
  }

  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let running = false, raf = null;
  const t0 = performance.now();
  function frame() {
    const elapsed = (performance.now() - t0) / 1000;
    updateParticles(elapsed);
    updateRipples(elapsed);
    sachet.rotation.z = -0.95 + Math.sin(elapsed * 1.3) * 0.02;   // gentle idle sway
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf), raf = null; }

  const vis = new IntersectionObserver((en) => { en[0].isIntersecting ? start() : stop(); }, { threshold: 0 });
  vis.observe(host);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  return {
    dispose() {
      stop(); vis.disconnect(); ro.disconnect();
      geo.dispose(); mat.dispose(); packTex.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.remove();
    }
  };
}
