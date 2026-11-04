const res = await fetch('http://127.0.0.1:9222/json/list');
const pages = await res.json();
const page = pages.find((p) => p.type === 'page');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => socket.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', (e) => {
  const d = JSON.parse(e.data);
  if (d.id && pending.has(d.id)) {
    const { resolve } = pending.get(d.id);
    pending.delete(d.id);
    resolve(d.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    id += 1;
    pending.set(id, { resolve });
    socket.send(JSON.stringify({ id, method, params }));
  });
const r = await send('Runtime.evaluate', { expression: 'JSON.stringify(window.__camState)', returnByValue: true });
console.log(r.result.value);
socket.close();
