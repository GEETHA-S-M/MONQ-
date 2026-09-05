
/* ============================================================
   monq. — 3D product viewer

   Loaded lazily (dynamic import, only once the viewer scrolls near
   the viewport) so three.js never sits in the critical path.

   NOTE ON GEOMETRY: the project ships no GLB/GLTF of the sachet, so
   this builds the pouch procedurally — a pillow-pouch profile with a
   crimped top and bottom seam — and maps the existing pack artwork
   onto its faces. Swap buildPouch() for a GLTFLoader call the moment
   a real model exists; everything else here (controls, lighting,
   auto-rotate, zoom, resize, disposal) stays as is.
   ============================================================ */
import * as THREE from './vendor/three/three.module.min.js';
import { OrbitControls } from './vendor/three/controls/OrbitControls.js';
import { Reflector } from './vendor/three/objects/Reflector.js';

/* Small canvas-drawn textures — cheaper and more controllable than
   shipping image files for effects this subtle. */
function radialAlphaTexture(THREE, inner, outer, alpha) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 128 * inner, 128, 128, 128 * outer);
  g.addColorStop(0, 'rgba(0,0,0,' + alpha + ')');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noiseTexture(THREE, size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    // low-frequency-ish luma noise so it reads as matte micro-grain,
    // not TV static, once tiled small across the pouch
    const v = 168 + Math.random() * 55;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 4);
  return t;
}

export function mount(host, opts) {
  opts = opts || {};
  const texUrl = opts.texture || 'assets/img/pack-0.webp';

  const renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.1, 4.4);

  /* ---- lighting: matched to the site's teal-accented spotlight ----
     A key light high and slightly right (the site's cone falls from
     top), a cool-ish fill to keep the shadow side from going muddy,
     and a teal rim from behind to separate the pouch from the dark
     backdrop. Same hues as --gold (now teal) / --tan / --bg. */
  const key = new THREE.DirectionalLight(0xffe6bd, 3.3);
  key.position.set(2.4, 4.2, 3.0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8899bb, 0.5);
  fill.position.set(-3.2, -0.6, 1.8);
  scene.add(fill);

  // teal rim from behind-left, cool rim from behind-right — together
  // they trace the whole silhouette against the dark backdrop instead
  // of just one edge
  const rim = new THREE.DirectionalLight(0x3e9188, 1.7);
  rim.position.set(-1.4, 1.2, -3.4);
  scene.add(rim);

  const rim2 = new THREE.DirectionalLight(0x9fb4d8, 0.7);
  rim2.position.set(1.8, 0.4, -3.0);
  scene.add(rim2);

  scene.add(new THREE.AmbientLight(0xffdcb0, 0.45));

  /* A procedural studio environment stands in for an HDRI file: a warm
     vertical gradient, brightest overhead, so the foil picks up a
     plausible spotlight reflection without shipping a .hdr. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envGeo = new THREE.SphereGeometry(10, 32, 16);
  const envMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vP;
      void main(){
        float h = normalize(vP).y * 0.5 + 0.5;
        vec3 floorC = vec3(0.055, 0.038, 0.022);
        vec3 midC   = vec3(0.30, 0.20, 0.115);
        vec3 topC   = vec3(1.00, 0.86, 0.63);
        vec3 c = mix(floorC, midC, smoothstep(0.0, 0.55, h));
        c = mix(c, topC, smoothstep(0.72, 1.0, h));
        gl_FragColor = vec4(c, 1.0);
      }`
  });
  envScene.add(new THREE.Mesh(envGeo, envMat));
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;

  /* ---- the pouch ---- */
  const loader = new THREE.TextureLoader();
  const tex = loader.load(texUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // matte micro-grain, mixed into roughness so the foil isn't a perfectly
  // uniform mirror — this is what keeps it from reading as "too CGI"
  const grain = noiseTexture(THREE, 128);

  const group = new THREE.Group();
  scene.add(group);

  const H_POUCH = 1.72;   // shared with buildPouch(); floor sits at its base

  // ---- soft contact shadow: a blurred alpha blob on the ground,
  // separate from (and cheaper than) real shadow-mapping, and it never
  // shows the hard-edged artifacts a small shadow map would at this scale
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.6),
    new THREE.MeshBasicMaterial({
      map: radialAlphaTexture(THREE, 0.15, 1, 0.55),
      transparent: true, depthWrite: false, toneMapped: false
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -H_POUCH / 2 - 0.012;
  contactShadow.renderOrder = -1;
  scene.add(contactShadow);

  // ---- soft floor reflection: rendered at low resolution so the
  // blur is essentially free (no extra blur pass) and it reads as a
  // sheen on dark flooring rather than a literal mirror
  const floorRefl = new Reflector(new THREE.PlaneGeometry(6, 6), {
    color: 0x1a120a, textureWidth: 256, textureHeight: 256, clipBias: 0.001
  });
  floorRefl.material.transparent = true;
  floorRefl.material.opacity = 0.22;
  floorRefl.rotation.x = -Math.PI / 2;
  floorRefl.position.y = -H_POUCH / 2 - 0.014;
  scene.add(floorRefl);

  // ---- volumetric light hint: a soft additive cone behind the pouch,
  // echoing the site's own top-down spotlight glow
  const godray = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 4.6),
    new THREE.MeshBasicMaterial({
      map: radialAlphaTexture(THREE, 0, 0.85, 0.5),
      color: 0xffdca8, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.35
    })
  );
  godray.position.set(0.3, 0.5, -1.9);
  scene.add(godray);

  function buildPouch() {
    const W = 1.28, H = 1.72, D = 0.30;

    // Body: a rounded box, squashed in Z, so the faces read as a
    // pillow pouch rather than a hard carton.
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, D, 48, 48, 8),
      new THREE.MeshPhysicalMaterial({
        map: tex, roughnessMap: grain, roughness: 0.42, metalness: 0.28,
        clearcoat: 0.55, clearcoatRoughness: 0.35,
        sheen: 0.5, sheenColor: new THREE.Color(0xffe9c8)
      })
    );
    // bulge the front/back faces outward toward the middle, pinch the edges
    const pos = body.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const fx = 1 - Math.pow(Math.abs(x) / (W / 2), 2.1);
      const fy = 1 - Math.pow(Math.abs(y) / (H / 2), 2.6);
      const swell = Math.max(0, fx * fy);
      pos.setZ(i, z * (0.42 + swell * 1.55));
      // draw the very top and bottom in toward the seam
      if (Math.abs(y) > H / 2 - 0.012) pos.setX(i, x * 0.965);
    }
    body.geometry.computeVertexNormals();
    group.add(body);

    // Crimped seams, top and bottom — flattened cylinders standing in
    // for the heat-sealed crimp on the real sachet
    const seamMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbb392, roughnessMap: grain, roughness: 0.55, metalness: 0.35,
      clearcoat: 0.4, clearcoatRoughness: 0.4
    });
    [H / 2 - 0.008, -H / 2 + 0.008].forEach((y, i) => {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(W * 0.985, 0.085, 0.055), seamMat);
      seam.position.set(0, y, 0);
      seam.rotation.z = i ? -0.004 : 0.004;
      group.add(seam);
    });

    return body;
  }

  buildPouch();

  /* ---- controls ---- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 2.6;      // pinch / wheel zoom range
  controls.maxDistance = 7.0;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 0.7;
  controls.minPolarAngle = Math.PI * 0.16;
  controls.maxPolarAngle = Math.PI * 0.86;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.15;

  // auto-rotate pauses while the visitor is driving, and resumes after
  // a beat of stillness
  let idleTimer = null;
  const IDLE_MS = 2600;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    renderer.domElement.style.cursor = 'grabbing';
    if (idleTimer) clearTimeout(idleTimer);
  });
  controls.addEventListener('end', () => {
    renderer.domElement.style.cursor = 'grab';
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { controls.autoRotate = true; }, IDLE_MS);
  });

  /* ---- sizing ---- */
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  /* ---- passive pointer tilt: a gentle turn toward the cursor even
     without a drag, so the pouch feels alive on hover, not just when
     grabbed. Small and always eased toward its target, so it never
     fights an active OrbitControls drag. ---- */
  let tiltX = 0, tiltZ = 0, tiltTX = 0, tiltTZ = 0;
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.buttons) return;   // a drag is already steering via OrbitControls
    const r = host.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    tiltTZ = -nx * 0.07;   // ~4°
    tiltTX = ny * 0.05;
  });
  renderer.domElement.addEventListener('pointerleave', () => { tiltTX = 0; tiltTZ = 0; });

  /* ---- render loop, paused when off screen ---- */
  let running = false, raf = null, t = 0;
  function frame() {
    controls.update();
    t += 0.012;
    group.position.y = Math.sin(t) * 0.028;             // gentle idle float
    tiltX += (tiltTX - tiltX) * 0.06;
    tiltZ += (tiltTZ - tiltZ) * 0.06;
    group.rotation.x = tiltX;
    group.rotation.z = tiltZ;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf), raf = null; }

  const vis = new IntersectionObserver((en) => {
    en[0].isIntersecting ? start() : stop();
  }, { threshold: 0 });
  vis.observe(host);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  return {
    dispose() {
      stop(); vis.disconnect(); ro.disconnect();
      controls.dispose(); envRT.dispose(); pmrem.dispose();
      envGeo.dispose(); envMat.dispose(); tex.dispose(); grain.dispose();
      // traverse() below disposes geometry + material for every mesh already
      // in the scene graph (pouch, seams, contact shadow, god-ray, floor
      // reflector) — only the extra map textures traverse doesn't reach
      // need disposing by hand here
      contactShadow.material.map.dispose();
      godray.material.map.dispose();
      if (floorRefl.getRenderTarget) floorRefl.getRenderTarget().dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material])
          .forEach((m) => m.dispose());
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.remove();
    }
  };
}
