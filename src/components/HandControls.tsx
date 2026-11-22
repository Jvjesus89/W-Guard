import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Hand } from 'lucide-react';
import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

/* ========================================================================== */
/*  Controle da cena 3D com a mão, pela câmera do notebook (MediaPipe)        */
/*  - pinça (polegar + indicador) e arrastar: gira                            */
/*  - pinça e aproximar/afastar a mão da câmera: zoom                         */
/*  - pinça rápida sem arrastar: seleciona a peça sob o cursor                */
/*  - duas mãos abertas: afastar explode, aproximar monta                     */
/*  O vídeo é processado só no navegador; nada sai da máquina.                */
/* ========================================================================== */

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const PINCH_ON = 0.33; // distância polegar-indicador / tamanho da mão
const PINCH_OFF = 0.5;
const TAP_MS = 350;
const TAP_MOVE = 0.03;

const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
/** Distância polegar-indicador relativa ao tamanho da mão: pequena = pinça. */
const pinchRatio = (h: NormalizedLandmark[]) => dist(h[4], h[8]) / Math.max(1e-3, dist(h[0], h[9]));
/** Mão aberta: indicador, médio, anelar e mindinho esticados (ponta mais longe do pulso que a articulação do meio). */
const isOpen = (h: NormalizedLandmark[]) =>
  [8, 12, 16, 20].every((tip) => dist(h[0], h[tip]) > dist(h[0], h[tip - 2]) * 1.15) && pinchRatio(h) > PINCH_OFF;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Usa só o miolo da imagem: não precisa levar a mão até a borda da câmera. */
const fit = (v: number) => clamp01((v - 0.15) / 0.7);

const TWO_HANDS_MIN_GAP = 0.12; // distância mínima entre as palmas (fração da largura da imagem)
const TWO_HANDS_FRAMES = 5; // ~1/6 s seguidos com duas mãos antes de mexer na explosão

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 3;
const ZOOM_DEADZONE = 0.06; // ignora a variação natural do tamanho da mão enquanto ela só se move de lado

type Props = {
  stageRef: RefObject<HTMLDivElement | null>;
  zoomRef: RefObject<number>;
  onExplode: (value: number) => void;
};

export default function HandControls({ stageRef, zoomRef, onExplode }: Props) {
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState<{ x: number; y: number; pinch: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!on) return;
    let stopped = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let landmarker: HandLandmarker | null = null;
    let lastVideoTime = -1;
    const pos = { x: 0.5, y: 0.5 };
    let pinch: { t: number; x: number; y: number; size: number; zoom: number } | null = null;
    let size = 0;
    let explode: number | null = null;
    let twoHandFrames = 0;

    const canvas = () => stageRef.current?.querySelector('canvas') ?? null;
    /** Simula o mouse na cena: o OrbitControls gira e o R3F seleciona como se fosse clique. */
    const send = (type: 'pointerdown' | 'pointermove' | 'pointerup' | 'click') => {
      const c = canvas();
      if (!c) return;
      const r = c.getBoundingClientRect();
      const init = {
        clientX: r.left + pos.x * r.width,
        clientY: r.top + pos.y * r.height,
        bubbles: true,
        button: 0,
        buttons: type === 'pointerdown' || (type === 'pointermove' && pinch) ? 1 : 0,
      };
      const event =
        type === 'click'
          ? new MouseEvent('click', init)
          : new PointerEvent(type, { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true });
      // o R3F usa offsetX/Y para achar a peça, e em evento sintético o navegador pode calcular errado (zoom/escala)
      Object.defineProperties(event, {
        offsetX: { value: init.clientX - r.left },
        offsetY: { value: init.clientY - r.top },
      });
      c.dispatchEvent(event);
    };

    const release = (now: number) => {
      if (!pinch) return;
      const tap = now - pinch.t < TAP_MS && Math.hypot(pos.x - pinch.x, pos.y - pinch.y) < TAP_MOVE;
      pinch = null;
      send('pointerup');
      if (tap) send('click');
    };

    const frame = () => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const video = videoRef.current;
      if (!video || !landmarker || video.readyState < 2 || video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;
      const now = performance.now();
      const result = landmarker.detectForVideo(video, now);
      const hands = result.landmarks;
      // só explode com as duas mãos abertas (a pinça é de girar; mão curvada no teclado não conta),
      // uma esquerda e uma direita (o detector às vezes vê a mesma mão duas vezes), afastadas, por alguns quadros
      const twoHands =
        hands.length >= 2 &&
        result.handedness[0]?.[0]?.categoryName !== result.handedness[1]?.[0]?.categoryName &&
        Math.abs(hands[0][9].x - hands[1][9].x) > TWO_HANDS_MIN_GAP &&
        isOpen(hands[0]) &&
        isOpen(hands[1]);
      twoHandFrames = twoHands ? twoHandFrames + 1 : 0;

      if (twoHands) {
        // duas mãos: a distância entre as palmas vira o quanto a vista está explodida
        release(now);
        setCursor(null);
        if (twoHandFrames < TWO_HANDS_FRAMES) return;
        const d = clamp01((Math.abs(hands[0][9].x - hands[1][9].x) - 0.2) / 0.45);
        explode = explode === null ? d : explode + (d - explode) * 0.35;
        onExplode(explode);
        return;
      }
      explode = null;

      const h = hands[0];
      if (!h) {
        release(now);
        setCursor(null);
        return;
      }
      // tamanho da mão na imagem (pulso -> base do dedo médio): cresce quando ela chega perto da câmera
      const handSize = dist(h[0], h[9]);
      size = size ? size + (handSize - size) * 0.3 : handSize;
      const ratio = pinchRatio(h);
      // cursor no meio da pinça, espelhado (a câmera vê a mão invertida)
      const tx = fit(1 - (h[4].x + h[8].x) / 2);
      const ty = fit((h[4].y + h[8].y) / 2);
      pos.x += (tx - pos.x) * 0.5;
      pos.y += (ty - pos.y) * 0.5;

      if (!pinch && ratio < PINCH_ON) {
        pinch = { t: now, x: pos.x, y: pos.y, size, zoom: zoomRef.current };
        send('pointerdown');
      } else if (pinch && ratio > PINCH_OFF) {
        release(now);
      } else {
        send('pointermove');
        if (pinch) {
          // pinça + aproximar a mão da câmera: zoom; afastar: tira o zoom
          const grow = size / pinch.size;
          const eased = Math.abs(grow - 1) < ZOOM_DEADZONE ? 1 : grow - Math.sign(grow - 1) * ZOOM_DEADZONE;
          zoomRef.current = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinch.zoom * eased ** 1.5));
        }
      }
      setCursor({ x: pos.x, y: pos.y, pinch: !!pinch });
    };

    (async () => {
      try {
        setStatus('pedindo acesso à câmera...');
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        if (stopped) return;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setStatus('carregando detector de mãos...');
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
        const files = await FilesetResolver.forVisionTasks(WASM);
        landmarker = await HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        if (stopped) return;
        setStatus('');
        frame();
      } catch (err) {
        setStatus(err instanceof DOMException && err.name === 'NotAllowedError' ? 'acesso à câmera negado' : 'não foi possível iniciar a câmera');
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (pinch) send('pointerup');
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
      zoomRef.current = 1; // sem gestos não há como tirar o zoom, então volta ao normal
      setCursor(null);
    };
  }, [on, stageRef, zoomRef, onExplode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`absolute top-16 left-4 z-20 flex items-center md:left-6 gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold backdrop-blur transition-colors ${
          on ? 'border-brand-400 bg-brand-500 text-white' : 'border-line bg-panel/80 text-ink-muted hover:text-ink-strong'
        }`}
      >
        <Hand className="h-3.5 w-3.5" />
        {on ? 'Gestos ligados' : 'Controlar com a mão'}
      </button>

      {on && (
        <div className="pointer-events-none absolute top-16 right-4 z-20 w-40 overflow-hidden rounded-xl border border-line bg-panel/90 shadow-lg md:right-6">
          <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full -scale-x-100 object-cover" />
          <p className="px-2 py-1.5 text-[9px] leading-snug text-ink-muted">
            {status || 'pinça e arraste: gira · pinça e aproxime/afaste a mão: zoom · pinça rápida: seleciona · duas mãos abertas, afaste: explode'}
          </p>
        </div>
      )}

      {cursor && (
        <span
          className={`pointer-events-none absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[background-color,transform] ${
            cursor.pinch ? 'scale-75 border-brand-400 bg-brand-400/70' : 'border-brand-400 bg-brand-400/15'
          }`}
          style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
        />
      )}
    </>
  );
}
