/**
 * Verificação visual: captura screenshots do site via Chrome DevTools Protocol.
 * Uso: node tools/shot.mjs <url> <out.png> [--w=1440] [--h=1000] [--y=0] [--theme=dark|light] [--wait=900]
 */
const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = Object.fromEntries(
  args
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? 'true'];
    }),
);

const width = Number(opt.w ?? 1440);
const height = Number(opt.h ?? 1000);
const scrollY = Number(opt.y ?? 0);
const theme = opt.theme ?? 'dark';
const wait = Number(opt.wait ?? 1200);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      const pages = await res.json();
      const page = pages.find((p) => p.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  throw new Error('CDP indisponível');
}

const wsUrl = await connect();
const socket = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let id = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(new Error(JSON.stringify(data.error)));
    else resolve(data.result);
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    id += 1;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true });
  return result.result?.value;
};

await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
});

const cacheBusted = url.replace('#', `?cb=${Date.now()}#`);
await send('Page.navigate', { url: cacheBusted });

for (let attempt = 0; attempt < 60; attempt += 1) {
  const ready = await evaluate("document.readyState === 'complete' && !!document.querySelector('canvas, #root > *')");
  if (ready) break;
  await sleep(200);
}
await sleep(wait);

await evaluate(`(() => {
  const theme = ${JSON.stringify(theme)};
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.scrollBehavior = 'auto';\n  try { localStorage.setItem('wguard-theme', theme); } catch (e) {}
})()`);

await sleep(500);
await evaluate(`window.scrollTo(0, ${scrollY})`);
await sleep(Math.max(wait, 900));
await evaluate(`window.scrollTo(0, ${scrollY})`);
await sleep(400);

const scrollState = await evaluate('JSON.stringify({y: Math.round(window.scrollY), h: document.body.scrollHeight, vh: innerHeight})');
await send('Page.captureScreenshot', { format: 'png', fromSurface: true }).then(async (shot) => {
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { dirname } = await import('node:path');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
});
console.log(`saved ${out} (${width}x${height} @${scrollY} ${theme}) ${scrollState}`);

socket.close();
