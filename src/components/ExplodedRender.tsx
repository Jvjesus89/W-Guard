import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { METER_PARTS, type MeterPartId } from '../data/meter';

/* ========================================================================== */
/*  Vista explodida renderizada no Blender                                    */
/*  - frames: quadros da explosão (fundo transparente), escolhidos pelo scroll */
/*  - máscara: as mesmas vistas com uma cor chapada por peça, usada para       */
/*    saber qual peça está sob o cursor e para destacar a peça escolhida       */
/*  Gerado por blender/wguard_explosao.blend                                  */
/* ========================================================================== */

const BASE = `${import.meta.env.BASE_URL}explode/`;
const FRAMES = 40;
const FRAME_W = 1500;
const FRAME_H = 1200;
const MASK_W = 375;
const MASK_H = 300;
const MASK_COLS = 8;
const frameUrl = (i: number) => `${BASE}frame_${String(i).padStart(2, '0')}.webp`;
const MASK_URL = `${BASE}mask_sheet.png`;

/** Cor de cada peça na máscara (tem que bater com o script do Blender). */
const MASK_COLORS: Record<MeterPartId, [number, number, number]> = {
  body: [255, 0, 0],
  sensor: [0, 255, 0],
  power: [0, 0, 255],
  pcb: [255, 255, 0],
  cap: [255, 0, 255],
  lora: [0, 255, 255],
};
const IDS = Object.keys(MASK_COLORS) as MeterPartId[];
const ACCENT = Object.fromEntries(METER_PARTS.map((p) => [p.id, p.accent])) as Record<MeterPartId, string>;
const ORDER = Object.fromEntries(METER_PARTS.map((p) => [p.id, p.order])) as Record<MeterPartId, number>;
const NAME = Object.fromEntries(METER_PARTS.map((p) => [p.id, p.name])) as Record<MeterPartId, string>;

type Labels = Partial<Record<MeterPartId, { x: number; y: number }>>;

function idAt(data: Uint8ClampedArray, i: number): MeterPartId | null {
  if (data[i + 3] < 128) return null;
  let best: MeterPartId | null = null;
  let bestD = 90 * 90;
  for (const id of IDS) {
    const [r, g, b] = MASK_COLORS[id];
    const d = (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

type Props = {
  theme: 'light' | 'dark';
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId) => void;
  progressRef: RefObject<number>;
};

export default function ExplodedRender({ theme, selected, onSelect, progressRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>(Array(FRAMES).fill(null));
  const maskSheet = useRef<CanvasRenderingContext2D | null>(null);
  const maskCache = useRef(new Map<number, { data: Uint8ClampedArray; ids: Int8Array; labels: Labels }>());
  const overlay = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = MASK_W;
    c.height = MASK_H;
    return c;
  }, []);

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState<MeterPartId | null>(null);
  const [ready, setReady] = useState(false);
  const [maskReady, setMaskReady] = useState(false);
  const [box, setBox] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const smooth = useRef(0);
  const indexRef = useRef(0);

  /* ---------------------------------------------------------------- carga */
  useEffect(() => {
    let cancelled = false;
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!cancelled) frames.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameUrl(i);
      });
    // primeiro e último quadro primeiro, depois o resto em ordem
    load(0).then(() => {
      if (cancelled) return;
      setReady(true);
      load(FRAMES - 1);
      const rest = Array.from({ length: FRAMES - 2 }, (_, k) => k + 1);
      const next = () => {
        const i = rest.shift();
        if (i === undefined || cancelled) return;
        load(i).then(next);
      };
      next();
      next();
      next();
    });

    const mask = new Image();
    mask.onload = () => {
      if (cancelled) return;
      const c = document.createElement('canvas');
      c.width = mask.naturalWidth;
      c.height = mask.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(mask, 0, 0);
      maskSheet.current = ctx;
      setMaskReady(true);
    };
    mask.src = MASK_URL;
    return () => {
      cancelled = true;
    };
  }, []);

  /** Máscara de um quadro: pixels, id por pixel e centro de cada peça (para os marcadores). */
  const maskFor = useCallback((i: number) => {
    const cached = maskCache.current.get(i);
    if (cached) return cached;
    const ctx = maskSheet.current;
    if (!ctx) return null;
    const col = i % MASK_COLS;
    const row = Math.floor(i / MASK_COLS);
    const { data } = ctx.getImageData(col * MASK_W, row * MASK_H, MASK_W, MASK_H);
    const ids = new Int8Array(MASK_W * MASK_H).fill(-1);
    const sum: Record<string, [number, number, number]> = {};
    for (let p = 0, k = 0; p < ids.length; p += 1, k += 4) {
      const id = idAt(data, k);
      if (!id) continue;
      ids[p] = IDS.indexOf(id);
      const s = (sum[id] ??= [0, 0, 0]);
      s[0] += p % MASK_W;
      s[1] += Math.floor(p / MASK_W);
      s[2] += 1;
    }
    const labels: Labels = {};
    for (const id of IDS) {
      const s = sum[id];
      if (s && s[2] > 30) labels[id] = { x: s[0] / s[2] / MASK_W, y: s[1] / s[2] / MASK_H };
    }
    const entry = { data, ids, labels };
    maskCache.current.set(i, entry);
    return entry;
  }, []);

  /* ------------------------------------------------------------- layout */
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      const scale = Math.min(r.width / FRAME_W, r.height / FRAME_H);
      const w = FRAME_W * scale;
      const h = FRAME_H * scale;
      setBox({ x: (r.width - w) / 2, y: (r.height - h) / 2, w, h });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  /* --------------------------------------------------------------- desenho */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const i = indexRef.current;
    // quadro mais próximo que já carregou
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < FRAMES && !img; d += 1) img = frames.current[i - d] ?? frames.current[i + d] ?? null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!img) return;
    const dpr = canvas.width / Math.max(1, canvas.clientWidth);
    const x = box.x * dpr;
    const y = box.y * dpr;
    const w = box.w * dpr;
    const h = box.h * dpr;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    ctx.drawImage(img, x, y, w, h);

    const mask = maskFor(i);
    if (!mask || (!selected && !hovered)) return;
    const octx = overlay.getContext('2d');
    if (!octx) return;
    const out = octx.createImageData(MASK_W, MASK_H);
    const sel = selected ? IDS.indexOf(selected) : -2;
    const hov = hovered && hovered !== selected ? IDS.indexOf(hovered) : -2;
    const selRgb = selected ? hexToRgb(ACCENT[selected]) : [0, 0, 0];
    const hovRgb = hovered ? hexToRgb(ACCENT[hovered]) : [0, 0, 0];
    for (let p = 0, k = 0; p < mask.ids.length; p += 1, k += 4) {
      const v = mask.ids[p];
      if (v === sel) {
        out.data[k] = selRgb[0];
        out.data[k + 1] = selRgb[1];
        out.data[k + 2] = selRgb[2];
        out.data[k + 3] = 150;
      } else if (v === hov) {
        out.data[k] = hovRgb[0];
        out.data[k + 1] = hovRgb[1];
        out.data[k + 2] = hovRgb[2];
        out.data[k + 3] = 90;
      }
    }
    octx.putImageData(out, 0, 0);
    // brilho em volta da peça
    ctx.globalCompositeOperation = 'destination-over';
    ctx.filter = `blur(${8 * dpr}px)`;
    ctx.drawImage(overlay, x, y, w, h);
    // tinta leve sobre a peça
    ctx.globalCompositeOperation = 'source-atop';
    ctx.filter = `blur(${0.6 * dpr}px)`;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(overlay, x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
  }, [box, hovered, selected, maskFor, overlay]);

  useEffect(() => {
    draw();
  }, [draw, index, ready, maskReady]);

  /* ------------------------------------------ scroll -> quadro (suavizado) */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = progressRef.current ?? 0;
      smooth.current += (target - smooth.current) * (1 - Math.exp(-9 * dt));
      const i = Math.round(smooth.current * (FRAMES - 1));
      if (i !== indexRef.current) {
        indexRef.current = i;
        setIndex(i);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  /* ------------------------------------------------------------- ponteiro */
  const pick = useCallback(
    (clientX: number, clientY: number): MeterPartId | null => {
      const wrap = wrapRef.current;
      const mask = maskFor(indexRef.current);
      if (!wrap || !mask) return null;
      const r = wrap.getBoundingClientRect();
      const u = (clientX - r.left - box.x) / box.w;
      const v = (clientY - r.top - box.y) / box.h;
      if (u < 0 || v < 0 || u >= 1 || v >= 1) return null;
      // procura num raio pequeno para facilitar o clique em peças finas (fios, antena)
      const cx = Math.floor(u * MASK_W);
      const cy = Math.floor(v * MASK_H);
      for (let rad = 0; rad <= 3; rad += 1) {
        for (let dy = -rad; dy <= rad; dy += 1) {
          for (let dx = -rad; dx <= rad; dx += 1) {
            const x = cx + dx;
            const y = cy + dy;
            if (x < 0 || y < 0 || x >= MASK_W || y >= MASK_H) continue;
            const id = mask.ids[y * MASK_W + x];
            if (id >= 0) return IDS[id];
          }
        }
      }
      return null;
    },
    [box, maskFor],
  );

  const labels = maskReady ? (maskFor(index)?.labels ?? {}) : {};
  const shadow = theme === 'dark' ? 'drop-shadow(0 24px 30px rgba(0,0,0,0.55))' : 'drop-shadow(0 22px 26px rgba(15,23,42,0.22))';

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full select-none"
      style={{ cursor: hovered ? 'pointer' : 'default' }}
      onPointerMove={(e) => setHovered(pick(e.clientX, e.clientY))}
      onPointerLeave={() => setHovered(null)}
      onClick={(e) => {
        const id = pick(e.clientX, e.clientY);
        if (id) onSelect(id);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ filter: shadow }} />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] tracking-widest text-ink-subtle uppercase">carregando renders...</span>
        </div>
      )}

      {/* marcadores numerados sobre cada peça */}
      {IDS.map((id) => {
        const l = labels[id];
        if (!l) return null;
        const active = selected === id;
        return (
          <button
            key={id}
            type="button"
            title={NAME[id]}
            aria-label={NAME[id]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
            onPointerEnter={() => setHovered(id)}
            className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[9px] font-bold shadow-md backdrop-blur transition-all duration-300 ${
              active ? 'scale-110 text-white' : 'bg-panel/85 text-ink-strong hover:scale-110'
            }`}
            style={{
              left: box.x + l.x * box.w,
              top: box.y + l.y * box.h,
              borderColor: ACCENT[id],
              backgroundColor: active ? ACCENT[id] : undefined,
            }}
          >
            0{ORDER[id]}
          </button>
        );
      })}
    </div>
  );
}
