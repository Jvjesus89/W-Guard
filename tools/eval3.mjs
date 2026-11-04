const res = await fetch('http://127.0.0.1:9222/json/list');
const pages = (await res.json()).filter((p) => p.type === 'page');
const page = pages[0];
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => socket.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
socket.addEventListener('message', (e) => { const d = JSON.parse(e.data); if (d.id && pending.has(d.id)) { const { resolve } = pending.get(d.id); pending.delete(d.id); resolve(d.result); } });
const send = (method, params = {}) => new Promise((resolve) => { id += 1; pending.set(id, { resolve }); socket.send(JSON.stringify({ id, method, params })); });
const expr = `(() => {
  const c = document.querySelector('canvas');
  const sec = document.getElementById('exploded');
  const sticky = sec ? sec.firstElementChild : null;
  const stage = c ? c.closest('.relative') : null;
  const r = (el) => el ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(el.getBoundingClientRect()) : null;
  return JSON.stringify({scrollY: window.scrollY, inner:[innerWidth, innerHeight], section: r(sec), sticky: r(sticky), stage: r(stage), canvas: r(c), canvasParent: r(c?.parentElement), dpr: devicePixelRatio});
})()`;
const out = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log(out.result.value);
socket.close();
