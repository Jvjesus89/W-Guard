const res = await fetch('http://127.0.0.1:9222/json/list');
const pages = (await res.json()).filter((p) => p.type === 'page');
for (const page of pages) {
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => socket.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) { const { resolve } = pending.get(d.id); pending.delete(d.id); resolve(d.result); }
  });
  const send = (method, params = {}) => new Promise((resolve) => { id += 1; pending.set(id, { resolve }); socket.send(JSON.stringify({ id, method, params })); });
  const r = await send('Runtime.evaluate', { expression: `JSON.stringify({u:location.href, canvases:document.querySelectorAll('canvas').length, cam: window.__camState ?? null, scripts:[...document.scripts].map(s=>s.src).filter(Boolean)})`, returnByValue: true });
  console.log(r.result.value);
  socket.close();
}
