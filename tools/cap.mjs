// Stage + capture the 4 dossier screenshots for SOLMAR BAY via CDP.
// Serves game/ locally, loads index.html, then drives the REAL game through
// window.__game (real fixed steps, real physics, real HUD) to stage each
// scene, and captures a 1280x720 JPEG into screenshots/.
//
//   node tools/cap.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '..');
const port = 8901;
const outDir = resolve(repo, 'screenshots');
const SHELL = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell`;
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(url, timeoutMs, label) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${label}: ${url}`);
}

let msgId = 0;
const pending = new Map();
let ws;
const consoleErrors = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (r.exceptionDetails) throw new Error('stage error: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result ? r.result.value : undefined;
}

// Each stage runs inside the page against window.__game. Synchronous:
// manual g.fixedStep(1/60) calls advance the real sim deterministically.
const STAGE = {
  's1-chase.jpg': `(() => {
    const g = window.__game;
    g.menus.hideTitle();
    g.mode = 'play'; g.introShown = true;
    const v = g.fleet.spawn('comet', -300, 90, Math.PI / 2);
    v.parked = false;
    g.player.enterVehicle(v);
    g.missions.start('first-errand');
    g.ui.hideDialogue();
    g.wanted.set(2);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    for (let i = 0; i < 100; i++) g.fixedStep(1 / 60);
    const p = g.player.vehicle.position, h = g.player.vehicle.heading;
    g.dispatch.units.forEach((u, i) => {
      const ax = i === 0 ? 18 : -22, az = i === 0 ? 7 : -6;
      u.vehicle.position.x = p.x + Math.sin(h) * ax + Math.cos(h) * az;
      u.vehicle.position.z = p.z + Math.cos(h) * ax - Math.sin(h) * az;
      u.vehicle.heading = h;
      u.vehicle.velocity.x = Math.sin(h) * 15;
      u.vehicle.velocity.z = Math.cos(h) * 15;
      const j = g.plan.nearestJunction(p.x, p.z);
      u.from = j.id;
      u.to = g.plan.nearestJunction(p.x + Math.sin(h) * 90, p.z + Math.cos(h) * 90).id;
      u.along = 0;
    });
    for (let i = 0; i < 10; i++) g.fixedStep(1 / 60);
    g.camera.snap({ x: p.x, z: p.z, y: 0 }, h);
    g.render();
    return 'chase speed=' + Math.round(g.player.vehicle.speed * 2.237) + 'mph units=' + g.dispatch.units.length + ' at=' + Math.round(p.x) + ',' + Math.round(p.z);
  })()`,
  's2-shootout.jpg': `(() => {
    const g = window.__game;
    g.menus.hideTitle();
    g.mode = 'play'; g.introShown = true;
    g.player.placeAt(-180, 60, Math.PI / 2);
    g.loadout.give('rifle', 23);
    g.loadout.select('rifle');
    const car = g.fleet.spawn('comet', -158, 56, 0);
    car.parked = true;
    for (const [gx, gz] of [[-170, 52], [-190, 68], [-172, 70], [-188, 50], [-168, 62]]) g.pedestrians.spawn(gx, gz, 'guard');
    for (let i = 0; i < 8; i++) g.pedestrians.spawn(-180 + ((i * 29) % 50) - 25, 60 + ((i * 17) % 40) - 20, 'civilian');
    g.wanted.set(3);
    for (let i = 0; i < 30; i++) g.fixedStep(1 / 60);
    g.dispatch.units.forEach((u, i) => {
      const a = [-2.2, -1.1, 0.6][i] || 0;
      const d = [26, 34, 30][i] || 30;
      u.vehicle.position.x = -180 + Math.sin(a) * d;
      u.vehicle.position.z = 60 + Math.cos(a) * d;
      u.vehicle.heading = Math.atan2(-180 - u.vehicle.position.x, 60 - u.vehicle.position.z);
      const j = g.plan.nearestJunction(-180, 60);
      u.from = j.id; u.to = j.id; u.along = 0;
    });
    g.combat.explodeAt({ x: -158, z: 56 });
    g.wanted.set(3);
    g.camera.snap({ x: -180, z: 60, y: 0 }, Math.PI / 2);
    g.render();
    return 'shootout npcs=' + g.pedestrians.npcs.length + ' wanted=' + g.wanted.level;
  })()`,
  's3-stats.jpg': `(() => {
    const g = window.__game;
    g.player.placeAt(-300, 60, 0);
    g.player.money = 2840;
    g.respect.rp = 150;
    g.player.stats.kills = 12;
    g.player.stats.carsStolen = 7;
    g.player.stats.copsEvaded = 0;
    g.player.stats.earned = 3200;
    g.activities.coinsCollected = 6;
    g.wanted.set(4);
    g.missions.start('gold-paint');
    g.ui.hideDialogue();
    g.menus.hideTitle();
    g.ui.update(0.016);
    g.minimap.draw();
    g.mode = 'pause';
    g.menus.showPause();
    g.render();
    return 'stats money=' + g.player.money + ' rp=' + g.respect.rp;
  })()`,
  's4-title.jpg': `(() => {
    const g = window.__game;
    return 'title mode=' + g.mode;
  })()`,
};
const SETTLE_MS = { 's1-chase.jpg': 900, 's2-shootout.jpg': 150, 's3-stats.jpg': 900, 's4-title.jpg': 2500 };

async function main() {
  mkdirSync(outDir, { recursive: true });
  const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: repo, stdio: 'ignore' });
  const browser = spawn(SHELL, [
    '--no-sandbox', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader',
    '--hide-scrollbars', '--window-size=1280,720',
    '--remote-debugging-port=9223', 'about:blank',
  ], { stdio: 'ignore' });
  try {
    await waitFor(`http://127.0.0.1:${port}/index.html`, 10000, 'game server');
    await waitFor('http://127.0.0.1:9223/json/version', 15000, 'headless shell');
    const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('no page target in headless shell');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        consoleErrors.push(`EXCEPTION ${d.text} ${d.exception?.description || ''}`);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push('CONSOLE ' + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
      }
    };
    await send('Page.enable');
    await send('Runtime.enable');
    for (const shot of shots) {
      consoleErrors.length = 0;
      const url = `http://127.0.0.1:${port}/index.html`;
      await send('Page.navigate', { url });
      let gameReady = false;
      const start = Date.now();
      while (Date.now() - start < 30000) {
        await sleep(500);
        try {
          const r = await send('Runtime.evaluate', { expression: 'typeof window.__game !== "undefined" && !!window.__game.scene', returnByValue: true });
          if (r.result && r.result.value === true) { gameReady = true; break; }
        } catch { /* retry */ }
      }
      if (!gameReady) {
        console.log(`SHOT ${shot.name}: GAME NOT READY after 30s — skipped`);
        continue;
      }
      await sleep(500);
      let stageResult = '(no stage)';
      try {
        stageResult = await evalJs(STAGE[shot.name]);
      } catch (e) {
        console.log(`SHOT ${shot.name}: STAGE FAILED: ${e.message}`);
        continue;
      }
      await sleep(SETTLE_MS[shot.name] || 800);
      let quality = 80;
      let buf = null;
      for (const q of [80, 60, 45]) {
        const cap = await send('Page.captureScreenshot', { format: 'jpeg', quality: q, clip: { x: 0, y: 0, width: 1280, height: 720, scale: 1 } });
        buf = Buffer.from(cap.data, 'base64');
        if (buf.length <= 262144) { quality = q; break; }
        quality = q;
      }
      const outPath = join(outDir, shot.name);
      writeFileSync(outPath, buf);
      const size = statSync(outPath).size;
      console.log(`SHOT ${shot.name}: ${size} bytes (quality ${quality}) ${size <= 262144 ? 'OK' : 'OVER 256 KiB!'} :: ${stageResult}`);
      if (consoleErrors.length) console.log('  errors:\n  ' + consoleErrors.join('\n  '));
    }
  } finally {
    try { ws?.close(); } catch { /* already closed */ }
    browser.kill('SIGKILL');
    server.kill('SIGKILL');
  }
}

main().catch((e) => { console.error('cap tool failed:', e.message); process.exit(1); });
