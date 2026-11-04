const res = await fetch('http://127.0.0.1:9222/json/list');
const pages = (await res.json()).filter((p) => p.type === 'page');
const socket = new WebSocket(pages[0].webSocketDebuggerUrl);
await new Promise((r) => socket.addEventListener('open', r, { once: true }));
let id=0; const pending=new Map();
socket.addEventListener('message',(e)=>{const d=JSON.parse(e.data); if(d.id&&pending.has(d.id)){const {resolve}=pending.get(d.id); pending.delete(d.id); resolve(d.result);}});
const send=(m,p={})=>new Promise((resolve)=>{id+=1;pending.set(id,{resolve});socket.send(JSON.stringify({id,method:m,params:p}));});
const expr=`(() => {
  const all=[...document.querySelectorAll('div')].filter(d=>d.textContent.trim()==='Placa de controle');
  const info=all.map(d=>{const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),z:cs.zIndex,op:cs.opacity,vis:cs.visibility,disp:cs.display,tf:cs.transform};});
  return JSON.stringify({count:all.length, info, inner:[innerWidth,innerHeight]});
})()`;
console.log((await send('Runtime.evaluate',{expression:expr,returnByValue:true})).result.value);
socket.close();
