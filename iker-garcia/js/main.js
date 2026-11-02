import * as THREE from '../vendor/three.module.min.js';
import { animate, stagger } from '../vendor/anime.esm.min.js';

/* ---------- datos ---------- */
const PROJECTS = [
  { id: 'dripzone',    n: 'Dripzone Shop',            y: '2022',            t: 'Ecommerce' },
  { id: 'leinn',       n: 'LEINN · RIVIA',            y: '2023',            t: 'Formación' },
  { id: 'berlanga',    n: 'Bar de Berlanga de Duero', y: '2024 · 2025',     t: 'Licitación' },
  { id: 'frezzyks',    n: 'Frezzyks',                 y: 'Dic 2024',        t: 'Retail' },
  { id: 'nueva-york',  n: 'Nueva York y ASETT',       y: 'Ene–may 2025',    t: 'Economía social · ponente' },
  { id: 'iapyme',      n: 'IApyme Consultores',       y: 'Abr 2025 → hoy',  t: 'Cofundador · CEO', main: true },
  { id: 'impulso',     n: 'Impulso Digital',          y: 'May 2025 → ene 2026', t: 'Consultoría', path: ['iapyme'] },
  { id: 'baranano',    n: 'Licores Barañano',         y: '2025 → hoy',      t: 'Software a medida', path: ['iapyme', 'impulso'] },
  { id: 'india-corea', n: 'India y Corea',            y: 'Ene–abr 2026',    t: 'Internacional', path: ['iapyme'] },
  { id: 'scarpa',      n: 'SCARPA',                   y: 'Sep 2026',        t: 'Shopify', path: ['iapyme'] },
  { id: 'gorobel',     n: 'Gorobel Kirol Gunea',      y: 'Oct 2026',        t: 'Consultoría', path: ['iapyme', 'impulso'] },
  { id: 'alambique',   n: 'Alambique',                y: 'Oct 2026 → hoy',  t: 'SaaS · MVP', path: ['iapyme', 'impulso', 'baranano'] },
  { id: 'internacional', n: 'Internacional',          y: 'Inglés C1',       t: 'Idiomas y viajes', x: true },
  { id: 'equipo',      n: 'Equipo',                   y: 'Con quién',       t: 'Liderazgo y testimonios', x: true },
  { id: 'herramientas', n: 'Herramientas',            y: 'Con qué',         t: 'Hard skills', x: true },
];
PROJECTS.forEach((p) => { p.img = `img/k_${p.id}.jpg`; p.g = !!(p.main || p.path); });
const G0 = PROJECTS.findIndex((p) => p.g), G1 = PROJECTS.length - 1 - [...PROJECTS].reverse().findIndex((p) => p.g);
const byId = (id) => PROJECTS.findIndex((p) => p.id === id);
const NP = PROJECTS.filter((p) => !p.x).length, X0 = PROJECTS.findIndex((p) => p.x);
const num = (i) => PROJECTS[i].x ? 'Extra' : `${pad(i)} / ${String(NP).padStart(2, '0')}`;
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
  if (i === 0 || i === G0 || i === X0) {
    const h = document.createElement('p');
    h.className = 'igh';
    h.innerHTML = i === 0 ? '<b>Antes de IApyme</b><span>2022 → 2025 · lo que me trajo hasta aquí</span>' : i === G0 ? '<b>IApyme Consultores</b><span>El proyecto principal y todo lo que ha salido de él</span>' : '<b>Cómo trabajo</b><span>Idiomas, equipo y herramientas</span>';
    gridEl.appendChild(h);
  }
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-i="${i}"><span class="ix">${p.x ? '+' : pad(i)}</span><span class="nm">${p.n}</span><span class="yr">${p.y}</span></button>`;
  nav.appendChild(li);
  const card = document.createElement('button');
  card.type = 'button'; card.className = 'icard' + (p.main ? ' main' : ''); card.dataset.i = i;
  card.innerHTML = `<span class="ic"><img src="${p.img}" alt="" loading="lazy" ></span><span class="il"><span class="ix">${p.x ? '+' : pad(i)}</span><span class="nm">${p.n}</span><span class="yr">${p.y}</span></span>`;
  gridEl.appendChild(card);
});
document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  if (o) { const k = byId(o.dataset.open); if (k > -1) { openCase(k); return; } }
  const b = e.target.closest('[data-i]');
  if (b && (b.closest('#projList') || b.closest('#indexGrid'))) openCase(+b.dataset.i);
});

/* el título grande de cada ficha se ajusta para que ninguna palabra se salga del panel */
function fitTitle() {
  const h = document.querySelector('#panelBody h3');
  if (!h) return;
  h.style.fontSize = '';
  let f = parseFloat(getComputedStyle(h).fontSize);
  while (h.scrollWidth > h.clientWidth + 1 && f > 18) { f -= 1.5; h.style.fontSize = f + 'px'; }
}
addEventListener('resize', () => { if (document.getElementById('panel').open) fitTitle(); });

/* panel */
const dlg = $('#panel'), body = $('#panelBody'), pix = $('#panelIx');
let cur = -1;
function openCase(i, fromHash) {
  cur = (i + N) % N;
  const p = PROJECTS[cur];
  const tpl = document.getElementById('case-' + p.id);
  body.innerHTML = tpl ? tpl.innerHTML : '';
  if (p.path) {
    const nav = document.createElement('nav');
    nav.className = 'crumb'; nav.setAttribute('aria-label', 'De dónde sale');
    nav.innerHTML = p.path.map((id) => `<button type="button" data-open="${id}">${PROJECTS[byId(id)].n}</button>`).join('<span aria-hidden="true">→</span>') + `<span aria-hidden="true">→</span><b>${p.n}</b>`;
    body.prepend(nav);
  }
  pix.textContent = num(cur);
  $('#panelNav').hidden = false;
  if (!dlg.open) dlg.showModal();
  fitTitle();
  body.parentElement.scrollTop = 0;
  if (!fromHash) { try { history.replaceState(null, '', '#' + p.id); } catch (e) {} }
}
function openPage(id) {
  const tpl = document.getElementById(id);
  body.innerHTML = tpl.innerHTML; cur = -1;
  pix.textContent = id === 'tpl-about' ? 'Sobre mí' : 'Contacto';
  $('#panelNav').hidden = true;
  if (!dlg.open) dlg.showModal();
  fitTitle();
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
  const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
  const hits = [];
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
    /* zona de detección fija: no se mueve al pasar el ratón, así la tarjeta no entra y sale del hover sola */
    const hit = new THREE.Mesh(geo, hitMat);
    hit.userData = { i };
    ring.add(hit); hits.push(hit);
    return m;
  });

  /* tamaño */
  let R = 3, cardScale = 1, ppu = 100, W2 = 0, H2 = 0, Rpx = 300, cardPx = 100, pfd = 300, inside = true;
  const pfEl = $('#pf'), pfs = pfEl.querySelector('svg'), pfPtr = $('#pfPtr'), pfRead = $('#pfRead');
  const layers = [...pfEl.querySelectorAll('.pf-k')].map((g) => ({ g, k: +g.dataset.k }));
  const grp = $('#grp'), grpTxt = $('#grpTxt'), grpArc = $('#grpArc'), grpTP = $('#grpTP'), grpDots = $('#grpDots');
  const dots = [];
  for (let k = G0; k <= G1; k++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', PROJECTS[k].main ? 7 : 4); if (PROJECTS[k].main) c.classList.add('m');
    grpDots.appendChild(c); dots.push(c);
  }
  const beam = $('#beam'), beamLine = $('#beamLine'), beamRet = $('#beamRet'), beamDot = $('#beamDot');
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;
    const m = Math.min(visW, visH * .86);
    R = m * .42;
    cardScale = Math.max(.42, R * .33);
    ppu = h / visH; W2 = w / 2; H2 = h / 2;
    Rpx = R * ppu; cardPx = cardScale * ppu;
    const inner = (R - cardScale * .62) * ppu;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const textH = rem * 5.25;
    inside = inner >= 190;
    pfd = inside ? Math.min(1.85 * inner, (inner * .97 - textH - 14) / .54, 720) : Math.min(1.7 * inner, 280);
    pfEl.style.setProperty('--pfd', pfd + 'px');
    const ctop = inside ? pfd * .54 + 14 : Rpx + cardPx * .5 + 30;
    center.style.setProperty('--ctop', ctop + 'px');
    center.style.setProperty('--cw', Math.min(w - 32, inside ? inner * 1.7 : 26 * rem) + 'px');
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
    pfEl.classList.add('on');
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
    if (e.pointerType !== 'mouse') { hasMouse = false; mouse.set(9, 9); setHover(-1); }
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
      const hit = ray.intersectObjects(hits)[0];
      if (hit) openCase(hit.object.userData.i);
    }
  });
  stage.addEventListener('pointerleave', () => { mouse.set(9, 9); });

  /* brújula */
  const handMouse = $('#handMouse'), handRing = $('#handRing'), dial = $('#dial');

  let focus = -2, sel = -1;
  function showFocus(i) {
    if (i === focus) return;
    focus = i;
    if (i > -1) {
      const p = PROJECTS[i];
      label.textContent = `/${p.n}`;
      const chip = p.main ? '<span class="cgrp">Proyecto matriz</span>' : (p.g ? '<span class="cgrp">IApyme</span>' : '');
      center.innerHTML = `<span class="crow"><span class="cix">${num(i)}</span>${chip}</span><span class="cnm">${p.n}</span><span class="cyr">${p.y} · ${p.t}</span>`;
    } else {
      label.textContent = '/Proyecto';
      center.innerHTML = `<span class="cnm">Iker García</span><span class="cyr"><span class="cme">Portfolio personal</span></span><span class="cyr">${NP} proyectos · 2022 → 2026</span>`;
    }
  }
  function setHover(i) {
    if (i === hovered) return;
    hovered = i;
    stage.style.cursor = i > -1 ? 'pointer' : 'grab';
  }
  setHover(-1); showFocus(-1);

  const tmp = new THREE.Vector3();
  let lx = 0, ly = 0, pa = 0, lastDeg = -1;
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
      const hs = ray.intersectObjects(hits);
      const keep = hs.some((h) => h.object.userData.i === hovered);
      setHover(keep ? hovered : (hs[0] ? hs[0].object.userData.i : -1));
    }

    cards.forEach((c) => {
      const u = c.userData;
      const a = u.base + angle;
      u.hover += ((u.i === hovered ? 1 : (!hasMouse && u.i === sel ? .55 : 0)) - u.hover) * .14;
      const rr = R * (1 + u.hover * .06);
      c.position.set(Math.cos(a) * rr, Math.sin(a) * rr, u.hover * .9);
      const tilt = .55 * (1 - u.hover);
      c.rotation.set(Math.sin(a) * tilt * .6, -Math.cos(a) * tilt, (a - Math.PI / 2) * .5 * (1 - u.hover * .8), 'XYZ');
      const s = cardScale * u.s * (PROJECTS[u.i].main ? 1.2 : 1) * (1 + u.hover * (PROJECTS[u.i].main ? .7 : .9));
      c.scale.set(s, s, 1);
      c.renderOrder = u.hover > .05 ? 2 : 1;
      c.material.depthTest = u.hover < .05;
      const hb = hits[u.i], ms = PROJECTS[u.i].main ? 1.2 : 1;
      hb.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      hb.rotation.set(Math.sin(a) * .55 * .6, -Math.cos(a) * .55, (a - Math.PI / 2) * .5, 'XYZ');
      const hsc = Math.max(.001, cardScale * u.s * ms * (1 + u.hover * .45));
      hb.scale.set(hsc, hsc, 1);
    });

    /* arco de IApyme: el proyecto matriz y lo que cuelga de él */
    {
      const half = (k) => cardPx * (PROJECTS[k].main ? 1.2 : 1) * .5 / Math.max(Rpx, 1);
      const a0 = cards[G0].userData.base + angle + half(G0) + .04, a1 = cards[G1].userData.base + angle - half(G1) - .04;
      const rA = inside ? Rpx + cardPx * .66 + 18 : Rpx - cardPx * .64 - 10;
      const P = (a, r) => `${(W2 + r * Math.cos(a)).toFixed(1)} ${(H2 - r * Math.sin(a)).toFixed(1)}`;
      /* arco dibujado por puntos: sin la ambigüedad del comando A de SVG cerca de 180° */
      const arcPts = (from, to, r) => { const n = 48; let d = ''; for (let k = 0; k <= n; k++) { const a = from + (to - from) * k / n; d += (k ? 'L' : 'M') + P(a, r); } return d; };
      const vis = cards[G1].userData.s > .3;
      grpArc.setAttribute('d', vis ? arcPts(a0, a1, rA) : '');
      const am = (a0 + a1) / 2, sm = Math.sin(am), low = sm < 0;
      const rT = rA + (low ? 19 : 8);
      grpTP.setAttribute('d', low ? arcPts(a1, a0, rT) : arcPts(a0, a1, rT));
      grpTxt.style.opacity = Math.min(1, Math.max(0, (Math.abs(sm) - .12) / .2)).toFixed(2);
      const fp = focus > -1 ? PROJECTS[focus] : null;
      const line = fp && fp.g ? new Set([...(fp.path || []), fp.id]) : null;
      dots.forEach((d, j) => {
        const k = G0 + j, a = cards[k].userData.base + angle;
        const [x, y] = P(a, rA).split(' ');
        d.setAttribute('cx', x); d.setAttribute('cy', y);
        d.classList.toggle('on', !!line && line.has(PROJECTS[k].id));
        d.style.opacity = cards[k].userData.s;
      });
      grp.classList.toggle('hot', !!line);
      grp.classList.toggle('lab', inside);
    }

    /* el retrato mira y señala */
    if (!hasMouse) {
      let best = 1e9;
      cards.forEach((c) => { const a = c.userData.base + angle - Math.PI / 2; const d = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))); if (d < best) { best = d; sel = c.userData.i; } });
    } else sel = -1;
    const fi = hovered > -1 ? hovered : sel;
    showFocus(fi);
    let tx, ty, aim = false;
    if (fi > -1) {
      const c = cards[fi];
      tmp.copy(c.position).project(camera);
      tx = (tmp.x * .5 + .5) * W2 * 2; ty = (-tmp.y * .5 + .5) * H2 * 2; aim = true;
    } else if (hasMouse && mouse.x < 5) { tx = mx; ty = my; }
    else { tx = W2; ty = H2 - Rpx; }
    const dx = tx - W2, dy = ty - H2, dist = Math.hypot(dx, dy) || 1;
    const st = Math.min(1, dist / Math.max(Rpx, 1));
    lx += (dx / dist * st - lx) * .09; ly += (dy / dist * st - ly) * .09;
    pfs.style.transform = `rotateY(${lx * 18}deg) rotateX(${-ly * 18}deg)`;
    layers.forEach((l) => l.g.setAttribute('transform', `translate(${(lx * l.k * 1.5).toFixed(2)} ${(ly * l.k * 1.5).toFixed(2)})`));
    const ta = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    let da = ta - pa; da = ((da + 540) % 360) - 180; pa += da * .15;
    pfPtr.setAttribute('transform', `rotate(${pa.toFixed(2)} 400 400)`);
    const deg = ((Math.round(pa) % 360) + 360) % 360;
    if (deg !== lastDeg) { lastDeg = deg; pfRead.textContent = `LOOK ${String(deg).padStart(3, '0')}°`; }
    if (aim && cards[fi].scale.x > .05) {
      const c = cards[fi];
      c.updateMatrixWorld();
      const P = [[-.5, -.375], [.5, -.375], [.5, .375], [-.5, .375]].map(([x, y]) => { tmp.set(x, y, 0); c.localToWorld(tmp); tmp.project(camera); return [(tmp.x * .5 + .5) * W2 * 2, (-tmp.y * .5 + .5) * H2 * 2]; });
      const gx = P.reduce((a, p) => a + p[0], 0) / 4, gy = P.reduce((a, p) => a + p[1], 0) / 4;
      const Q = P.map(([x, y]) => [gx + (x - gx) * 1.07, gy + (y - gy) * 1.07]);
      let d = '';
      Q.forEach((q, k) => {
        const a = Q[(k + 3) % 4], b = Q[(k + 1) % 4];
        const ua = Math.hypot(a[0] - q[0], a[1] - q[1]), ub = Math.hypot(b[0] - q[0], b[1] - q[1]);
        if (ua < 1 || ub < 1) return;
        const L = Math.min(18, ua * .25);
        d += `M${(q[0] + (a[0] - q[0]) / ua * L).toFixed(1)} ${(q[1] + (a[1] - q[1]) / ua * L).toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}L${(q[0] + (b[0] - q[0]) / ub * L).toFixed(1)} ${(q[1] + (b[1] - q[1]) / ub * L).toFixed(1)}`;
      });
      beamRet.setAttribute('d', d);
      const nx = dx / dist, ny = dy / dist;
      const r0 = pfd * .49 + 6;
      /* fin de la línea: borde del recuadro en la dirección del centro */
      let tEnd = dist;
      for (let k = 0; k < 4; k++) {
        const A = Q[k], B = Q[(k + 1) % 4];
        const ex = B[0] - A[0], ey = B[1] - A[1];
        const den = nx * ey - ny * ex; if (Math.abs(den) < 1e-6) continue;
        const t = ((A[0] - W2) * ey - (A[1] - H2) * ex) / den;
        const u2 = ((A[0] - W2) * ny - (A[1] - H2) * nx) / den;
        if (t > 0 && u2 >= 0 && u2 <= 1 && t < tEnd) tEnd = t;
      }
      if (tEnd > r0 + 2) {
        beamLine.setAttribute('d', `M${(W2 + nx * r0).toFixed(1)} ${(H2 + ny * r0).toFixed(1)}L${(W2 + nx * tEnd).toFixed(1)} ${(H2 + ny * tEnd).toFixed(1)}`);
        beamDot.setAttribute('cx', (W2 + nx * tEnd).toFixed(1)); beamDot.setAttribute('cy', (H2 + ny * tEnd).toFixed(1));
      } else { beamLine.setAttribute('d', ''); beamDot.setAttribute('cx', -99); }
    }
    beam.classList.toggle('on', aim && cards[fi].scale.x > .05);

    const dr = dial.getBoundingClientRect();
    const am = Math.atan2(my - (dr.top + dr.height / 2), mx - (dr.left + dr.width / 2)) * 180 / Math.PI - 90;
    handMouse.style.transform = `rotate(${am}deg)`;
    handRing.style.transform = `rotate(${-angle * 180 / Math.PI}deg)`;

    renderer.render(scene, camera);
  }
  frame();
}
