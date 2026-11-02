import * as THREE from '../vendor/three.module.min.js';
import { animate, stagger } from '../vendor/anime.esm.min.js';

/* ---------- datos ---------- */
const PROJECTS = [
  { id: 'dripzone',    n: 'Dripzone Shop',            y: '2022',          t: 'Ecommerce',      img: 'img/dripzone_perfil.jpg', fy: 0 },
  { id: 'leinn',       n: 'LEINN · RIVIA',            y: '2023',          t: 'Formación',      img: 'img/c_leinn.jpg' },
  { id: 'berlanga',    n: 'Bar de Berlanga de Duero', y: '2024 · 2025',   t: 'Licitación',     img: 'img/c_berlanga.jpg' },
  { id: 'frezzyks',    n: 'Frezzyks',                 y: 'Dic 2024',      t: 'Retail',         img: 'img/frezzyks_stand.jpg', fy: .35 },
  { id: 'slingdog',    n: 'Slingdog',                 y: 'En paralelo',   t: 'Producto',       img: 'img/slingdog_stand.jpg' },
  { id: 'nueva-york',  n: 'Nueva York',               y: 'Ene–mar 2025',  t: 'Economía social', img: 'img/c_nueva-york.jpg' },
  { id: 'iapyme',      n: 'IApyme Consultores',       y: 'Abr 2025 → hoy', t: 'Cofundador · CEO', img: 'img/w_lineaia.jpg', fy: .2 },
  { id: 'asett',       n: 'Foro ASETT',               y: 'Mayo 2025',     t: 'Ponencia',       img: 'img/asett.jpg', fy: .35 },
  { id: 'impulso',     n: 'Impulso Digital',          y: 'May 2025 → ene 2026', t: 'Consultoría', img: 'img/c_impulso.jpg' },
  { id: 'india-corea', n: 'India y Corea',            y: 'Ene–abr 2026',  t: 'Internacional',  img: 'img/iapyme_india.jpg' },
  { id: 'scarpa',      n: 'SCARPA',                   y: 'Sep 2026',          t: 'Shopify',        img: 'img/c_scarpa.jpg' },
  { id: 'gorobel',     n: 'Gorobel Kirol Gunea',      y: 'Oct 2026',      t: 'Consultoría',    img: 'img/w_propuesta.jpg', fx: 0, fy: 0 },
  { id: 'alambique',   n: 'Alambique',                y: 'Oct 2026 → hoy', t: 'SaaS · MVP', img: 'img/a_bodega.jpg', fx: .5, fy: 0 },
];
const N = PROJECTS.length;
let vel = 0;
const pad = (i) => String(i + 1).padStart(2, '0');

/* ---------- utilidades de interfaz ---------- */
const $ = (s) => document.querySelector(s);
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

/* tema */
const savedTheme = store('ig-theme');
if (savedTheme === 'dark' || savedTheme === 'light') root.setAttribute('data-theme', savedTheme);
const isDark = () => { const t = root.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
function toggleTheme() { const n = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', n); store('ig-theme', n); }
$('#themeBtn').addEventListener('click', toggleTheme);

/* lista accesible y vista índice */
const nav = $('#projList');
const gridEl = $('#indexGrid');
PROJECTS.forEach((p, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-i="${i}"><span class="ix">${pad(i)}</span><span class="nm">${p.n}</span><span class="yr">${p.y}</span></button>`;
  nav.appendChild(li);
  const card = document.createElement('button');
  card.type = 'button'; card.className = 'icard'; card.dataset.i = i;
  card.innerHTML = `<span class="ic"><img src="${p.img}" alt="" loading="lazy" style="object-position:${(p.fx ?? .5) * 100}% ${(p.fy ?? .5) * 100}%"></span><span class="il"><span class="ix">${pad(i)}</span><span class="nm">${p.n}</span><span class="yr">${p.y}</span></span>`;
  gridEl.appendChild(card);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-i]');
  if (b && (b.closest('#projList') || b.closest('#indexGrid'))) openCase(+b.dataset.i);
});

/* panel */
const dlg = $('#panel'), body = $('#panelBody'), pix = $('#panelIx');
let cur = -1;
function openCase(i, fromHash) {
  cur = (i + N) % N;
  const p = PROJECTS[cur];
  const tpl = document.getElementById('case-' + p.id);
  body.innerHTML = tpl ? tpl.innerHTML : '';
  pix.textContent = `${pad(cur)} / ${pad(N - 1)}`;
  $('#panelNav').hidden = false;
  if (!dlg.open) dlg.showModal();
  body.parentElement.scrollTop = 0;
  if (!fromHash) { try { history.replaceState(null, '', '#' + p.id); } catch (e) {} }
}
function openPage(id) {
  const tpl = document.getElementById(id);
  body.innerHTML = tpl.innerHTML; cur = -1;
  pix.textContent = id === 'tpl-about' ? 'Sobre mí' : 'Contacto';
  $('#panelNav').hidden = true;
  if (!dlg.open) dlg.showModal();
  body.parentElement.scrollTop = 0;
  try { history.replaceState(null, '', '#' + (id === 'tpl-about' ? 'sobre-mi' : 'contacto')); } catch (e) {}
}
$('#aboutBtn').addEventListener('click', () => openPage('tpl-about'));
$('#contactBtn').addEventListener('click', () => openPage('tpl-contact'));
$('#prevBtn').addEventListener('click', () => openCase(cur - 1));
$('#nextBtn').addEventListener('click', () => openCase(cur + 1));
$('#closeBtn').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} });
function fromHash() {
  const h = location.hash.slice(1);
  if (!h) return;
  if (h === 'sobre-mi') return openPage('tpl-about');
  if (h === 'contacto') return openPage('tpl-contact');
  const i = PROJECTS.findIndex((p) => p.id === h);
  if (i > -1) openCase(i, true);
}
addEventListener('hashchange', fromHash);

/* vista */
const layoutBtn = $('#layoutBtn');
function setIndex(on) {
  document.body.classList.toggle('is-index', on);
  layoutBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  layoutBtn.firstChild.nodeValue = on ? 'Ruleta ' : 'Índice ';
  store('ig-index', on ? '1' : '0');
  if (!on) running = true;
}
layoutBtn.addEventListener('click', () => setIndex(!document.body.classList.contains('is-index')));

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (dlg.open) {
    if (cur > -1 && e.key === 'ArrowRight') openCase(cur + 1);
    if (cur > -1 && e.key === 'ArrowLeft') openCase(cur - 1);
    return;
  }
  if (e.key === 't' || e.key === 'T') toggleTheme();
  if (e.key === 'l' || e.key === 'L') setIndex(!document.body.classList.contains('is-index'));
  if (e.key === 'ArrowRight') vel -= .02;
  if (e.key === 'ArrowLeft') vel += .02;
});

/* ---------- escena ---------- */
let running = true;
const stage = $('#stage');
const label = $('#projLabel');
const center = $('#center');
const pct = $('#loader');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }

if (!renderer) {
  document.body.classList.add('no-webgl');
  setIndex(true);
  pct.hidden = true;
} else {
  start();
}
if (store('ig-index') === '1') setIndex(true);
fromHash();

function start() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, 0, 10);

  const ring = new THREE.Group();
  scene.add(ring);

  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);
  let shownPct = 0;
  manager.onProgress = (_u, loaded, total) => {
    const target = Math.round(loaded / total * 100);
    animate({ v: shownPct }, { v: target, duration: 300, ease: 'outQuad', onUpdate: (a) => { shownPct = a.targets[0].v; pct.textContent = Math.round(shownPct) + '%'; } });
  };

  const CARD_W = 1, CARD_H = .75;
  const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const cards = PROJECTS.map((p, i) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide });
    loader.load(p.img, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const ia = tex.image.width / tex.image.height, ca = CARD_W / CARD_H;
      if (ia > ca) { tex.repeat.set(ca / ia, 1); tex.offset.set((1 - ca / ia) * (p.fx ?? .5), 0); }
      else { tex.repeat.set(1, ia / ca); tex.offset.set(0, (1 - ia / ca) * (1 - (p.fy ?? .5))); }
      mat.map = tex; mat.needsUpdate = true;
    });
    const m = new THREE.Mesh(geo, mat);
    m.userData = { i, s: 0, hover: 0, base: (Math.PI / 2) - (i / N) * Math.PI * 2 };
    ring.add(m);
    return m;
  });

  /* tamaño */
  let R = 3, cardScale = 1;
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    const m = Math.min(visW, visH * .86);
    R = m * .42;
    cardScale = Math.max(.42, R * .33);
  }
  resize();
  addEventListener('resize', resize);

  /* entrada tipo ruleta: aparecen en orden */
  let angle = reduce ? 0 : -Math.PI * .9;
  const spin = { a: angle };
  function intro() {
    const states = cards.map((c) => c.userData);
    states.forEach((s) => { s.s = 0; });
    if (reduce) { states.forEach((s) => (s.s = 1)); cards.forEach((c) => (c.material.opacity = 1)); angle = 0; return; }
    spin.a = -Math.PI * .9;
    animate(spin, { a: 0, duration: 2200, ease: 'outExpo', onUpdate: () => { angle = spin.a; } });
    animate(states, { s: 1, duration: 900, delay: stagger(85), ease: 'outBack(1.6)' });
    animate(cards.map((c) => c.material), { opacity: 1, duration: 500, delay: stagger(85), ease: 'outQuad' });
  }
  manager.onLoad = () => {
    animate(pct, { opacity: 0, duration: 400, delay: 200, ease: 'outQuad', onComplete: () => { pct.hidden = true; } });
    intro();
    center.classList.add('on');
  };
  $('#replayBtn').addEventListener('click', () => { if (document.body.classList.contains('is-index')) setIndex(false); intro(); });

  /* interacción */
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2(9, 9);
  let mx = innerWidth / 2, my = innerHeight / 2;
  let hovered = -1, dragging = false, moved = 0, lastX = 0, lastY = 0, downAt = 0;
  const AUTO = reduce ? 0 : .0016;

  addEventListener('wheel', (e) => {
    if (dlg.open || document.body.classList.contains('is-index')) return;
    vel += (e.deltaY + e.deltaX) * .00018;
  }, { passive: true });

  stage.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; downAt = performance.now();
    stage.setPointerCapture(e.pointerId);
  });
  let hasMouse = fine;
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') hasMouse = true;
    mx = e.clientX; my = e.clientY;
    const r = stage.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (dragging) {
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const a1 = Math.atan2(lastY - cy, lastX - cx), a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
      let d = a0 - a1; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      angle -= d; vel = -d * .6;
      moved += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
    }
  });
  stage.addEventListener('pointerup', (e) => {
    dragging = false;
    if (moved < 6 && performance.now() - downAt < 500) {
      const r = stage.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(cards)[0];
      if (hit) openCase(hit.object.userData.i);
    }
  });
  stage.addEventListener('pointerleave', () => { mouse.set(9, 9); });

  /* brújula */
  const handMouse = $('#handMouse'), handRing = $('#handRing'), dial = $('#dial');

  function setHover(i) {
    if (i === hovered) return;
    hovered = i;
    stage.style.cursor = i > -1 ? 'pointer' : 'grab';
    if (i > -1) {
      const p = PROJECTS[i];
      label.textContent = `/${p.n}`;
      center.innerHTML = `<span class="cix">${pad(i)}</span><span class="cnm">${p.n}</span><span class="cyr">${p.y} · ${p.t}</span>`;
    } else {
      label.textContent = '/Proyecto';
      center.innerHTML = `<span class="cplus">+</span><span class="cyr">2022 → 2026 · arrastra o pasa por encima</span>`;
    }
  }
  setHover(-1);

  const tmp = new THREE.Vector3();
  function frame() {
    requestAnimationFrame(frame);
    if (document.body.classList.contains('is-index') || document.hidden) return;

    if (!dragging) {
      const target = hovered > -1 ? 0 : AUTO;
      vel += (target - vel) * .04;
      angle += vel;
    }

    if (hasMouse && !dragging) {
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(cards)[0];
      setHover(hit ? hit.object.userData.i : -1);
    }

    cards.forEach((c) => {
      const u = c.userData;
      const a = u.base + angle;
      u.hover += ((u.i === hovered ? 1 : 0) - u.hover) * .14;
      const rr = R * (1 + u.hover * .06);
      c.position.set(Math.cos(a) * rr, Math.sin(a) * rr, u.hover * .9);
      const tilt = .55 * (1 - u.hover);
      c.rotation.set(Math.sin(a) * tilt * .6, -Math.cos(a) * tilt, (a - Math.PI / 2) * .5 * (1 - u.hover * .8), 'XYZ');
      const s = cardScale * u.s * (1 + u.hover * .9);
      c.scale.set(s, s, 1);
      c.renderOrder = u.hover > .05 ? 2 : 1;
      c.material.depthTest = u.hover < .05;
    });

    const dr = dial.getBoundingClientRect();
    const am = Math.atan2(my - (dr.top + dr.height / 2), mx - (dr.left + dr.width / 2)) * 180 / Math.PI - 90;
    handMouse.style.transform = `rotate(${am}deg)`;
    handRing.style.transform = `rotate(${-angle * 180 / Math.PI}deg)`;

    renderer.render(scene, camera);
  }
  frame();
}
