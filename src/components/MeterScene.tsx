import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox, useCursor, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { MeterPartId } from '../data/meter';

/* ========================================================================== */
/*  Posicionamento e parâmetros de explosão                                   */
/* ========================================================================== */

/** Posição de repouso (montado) no palco 3D.
 * O módulo LoRa fica completamente separado do hidrômetro à esquerda (X = -1.75).
 * O hidrômetro inteligente fica posicionado à direita (X = 1.15).
 */
const BASE_POS: Record<MeterPartId, [number, number, number]> = {
  body: [1.15, -1.15, 0],
  sensor: [1.15, -0.41, 0],
  power: [1.15, 0.205, 0],
  pcb: [1.15, 0.545, 0],
  cap: [1.15, 0.745, 0],
  lora: [-1.75, 0.05, 0],
};

/** Deslocamento interno de cada camada. */
const ORIGIN_OFFSET: Record<MeterPartId, number> = {
  body: 0,
  sensor: 0.22,
  power: 0.17,
  pcb: 0.025,
  cap: 0.06,
  lora: 0,
};

/** Deslocamento aplicado quando a vista está 100% explodida. */
const EXPLODE_OFFSET: Record<MeterPartId, [number, number, number]> = {
  body: [0, -0.5, 0],
  sensor: [0.35, -0.3, 0.2],
  power: [-0.3, 0.46, -0.1],
  pcb: [0.05, 0.96, 0.05],
  cap: [0.15, 1.46, 0.1],
  lora: [-0.4, 0.15, 0.25],
};

/** Atraso (0-1) de cada camada: a explosão acontece em cascata, de baixo para cima. */
const EXPLODE_DELAY: Record<MeterPartId, number> = {
  body: 0,
  sensor: 0.08,
  power: 0.16,
  pcb: 0.24,
  cap: 0.32,
  lora: 0.1,
};

/** Rotação (rad) que cada camada ganha ao explodir, para revelar volume e profundidade. */
const EXPLODE_TILT: Record<MeterPartId, [number, number, number]> = {
  body: [0, 0, 0],
  sensor: [0, 0.25, 0],
  power: [0, -0.35, 0],
  pcb: [0.06, 0.4, 0],
  cap: [-0.04, 0.55, 0],
  lora: [0, 0.28, 0],
};

const FLOAT_PHASE: Record<MeterPartId, number> = { body: 0, sensor: 1.1, power: 2.3, pcb: 3.4, cap: 4.5, lora: 5.6 };

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Progresso da camada com atraso e suavização (0 -> 1). */
function stagger(p: number, delay: number) {
  return easeInOutCubic(THREE.MathUtils.clamp((p - delay) / (1 - delay), 0, 1));
}

const ACCENT: Record<MeterPartId, string> = {
  cap: '#38bdf8',
  pcb: '#34d399',
  power: '#fbbf24',
  sensor: '#22d3ee',
  body: '#a78bfa',
  lora: '#f472b6',
};

/* ========================================================================== */
/*  Modelo do Blender (.glb)                                                  */
/* ========================================================================== */

/** Modelo exportado do Blender (blender/wguard.blend). Cada peça é um nó com o id da camada. */
const GLB_URL = '/models/wguard.glb';
useGLTF.preload(GLB_URL);

type Layout = {
  base: [number, number, number];
  origin: number;
  offset: [number, number, number];
  delay: number;
  tilt: [number, number, number];
};

const DEFAULT_LAYOUT = (id: MeterPartId): Layout => ({
  base: BASE_POS[id],
  origin: ORIGIN_OFFSET[id],
  offset: EXPLODE_OFFSET[id],
  delay: EXPLODE_DELAY[id],
  tilt: EXPLODE_TILT[id],
});

/** Escala metros (Blender) -> unidades do palco, por dispositivo. */
const GLB_SCALE = { hydro: 10, lora: 16 };
/** Ponto de apoio (base do aparelho) de cada dispositivo no palco. */
const GLB_ANCHOR = { hydro: [1.1, -1.9, 0] as [number, number, number], lora: [-2.45, -1.35, 0] as [number, number, number] };

/** Explosão do modelo real: a tampa sobe primeiro, depois placa e baterias; os sensores saem para a frente. */
const GLB_LAYOUT: Record<MeterPartId, Layout> = {
  cap: { base: GLB_ANCHOR.hydro, origin: 0, offset: [0, 1.7, 0], delay: 0, tilt: [0, 0.22, 0] },
  pcb: { base: GLB_ANCHOR.hydro, origin: 0, offset: [0.05, 1.05, 0.25], delay: 0.1, tilt: [0.05, 0.3, 0] },
  power: { base: GLB_ANCHOR.hydro, origin: 0, offset: [-0.1, 0.5, 0.75], delay: 0.18, tilt: [0, -0.22, 0] },
  sensor: { base: GLB_ANCHOR.hydro, origin: 0, offset: [-0.15, -0.15, 1.1], delay: 0.24, tilt: [0, 0.2, 0] },
  body: { base: GLB_ANCHOR.hydro, origin: 0, offset: [0, -0.3, 0], delay: 0.3, tilt: [0, 0, 0] },
  lora: { base: GLB_ANCHOR.lora, origin: 0, offset: [-0.3, 0.25, 0.35], delay: 0.1, tilt: [0, 0.28, 0] },
};

/** Peça do .glb: clona o nó (com materiais próprios, para o destaque não vazar entre peças) e alinha o aparelho pela base. */
function GlbNode({ id }: { id: MeterPartId }) {
  const { scene } = useGLTF(GLB_URL);
  const device = id === 'lora' ? 'lora' : 'hydro';

  const { object, shift } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const root = scene.getObjectByName(device);
    const node = scene.getObjectByName(id);
    const box = new THREE.Box3();
    if (root) box.setFromObject(root);
    const center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
    const bottom = box.isEmpty() ? 0 : box.min.y;
    const copy = node ? node.clone(true) : new THREE.Group();
    if (node?.parent) {
      copy.matrix.copy(node.parent.matrixWorld).multiply(node.matrix);
      copy.matrix.decompose(copy.position, copy.quaternion, copy.scale);
    }
    copy.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
    });
    return { object: copy, shift: [-center.x, -bottom, -center.z] as [number, number, number] };
  }, [scene, id, device]);

  return (
    <group scale={GLB_SCALE[device]}>
      <group position={shift}>
        <primitive object={object} />
      </group>
    </group>
  );
}

type PartProps = {
  id: MeterPartId;
  active: boolean;
  selected: boolean;
  onSelect: (id: MeterPartId) => void;
  onHover: (id: MeterPartId | null) => void;
  progressRef: RefObject<number>;
  layout?: Layout;
  children: ReactNode;
};

/** Camada do dispositivo: anima a explosão e destaca a peça sob o cursor. */
function Part({ id, active, selected, onSelect, onHover, progressRef, layout, children }: PartProps) {
  const group = useRef<THREE.Group>(null);
  const L = layout ?? DEFAULT_LAYOUT(id);
  const target = useMemo(() => new THREE.Vector3(), []);
  const accent = ACCENT[id];

  useCursor(active);

  useEffect(() => {
    group.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const glassy = material.transparent || (material as THREE.MeshPhysicalMaterial).transmission > 0;
      mesh.castShadow = !glassy;
      mesh.receiveShadow = true;
    });
  }, []);

  useEffect(() => {
    group.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) realify(mesh);
    });
  }, []);

  useEffect(() => {
    const root = group.current;
    if (!root) return;
    const touched: { material: THREE.MeshStandardMaterial; emissive: THREE.Color; intensity: number }[] = [];
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material;
      if (Array.isArray(material)) return;
      if (material instanceof THREE.MeshStandardMaterial) {
        touched.push({ material, emissive: material.emissive.clone(), intensity: material.emissiveIntensity });
        material.emissive.set(accent);
        material.emissiveIntensity = selected ? 0.5 : active ? 0.32 : 0;
      }
    });
    return () => {
      touched.forEach(({ material, emissive, intensity }) => {
        material.emissive.copy(emissive);
        material.emissiveIntensity = intensity;
      });
    };
  }, [active, selected, accent]);

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;
    const raw = progressRef.current ?? 0;
    const p = stagger(raw, L.delay);
    const base = L.base;
    const offset = L.offset;
    // Flutuação suave: aparece conforme a peça se afasta das demais.
    const bob = Math.sin(state.clock.elapsedTime * 0.9 + FLOAT_PHASE[id]) * 0.03 * p;
    target.set(base[0] + offset[0] * p, base[1] + offset[1] * p + bob, base[2] + offset[2] * p);
    root.position.x = THREE.MathUtils.damp(root.position.x, target.x, 7, delta);
    root.position.y = THREE.MathUtils.damp(root.position.y, target.y, 7, delta);
    root.position.z = THREE.MathUtils.damp(root.position.z, target.z, 7, delta);
    const tilt = L.tilt;
    root.rotation.x = THREE.MathUtils.damp(root.rotation.x, tilt[0] * p, 5, delta);
    root.rotation.y = THREE.MathUtils.damp(root.rotation.y, tilt[1] * p, 5, delta);
    root.rotation.z = THREE.MathUtils.damp(root.rotation.z, tilt[2] * p, 5, delta);
    const scale = selected ? 1.035 : active ? 1.015 : 1;
    const next = THREE.MathUtils.damp(root.scale.x, scale, 8, delta);
    root.scale.setScalar(next);
  });

  return (
    <group
      ref={group}
      position={L.base}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(id);
      }}
      onPointerOut={() => onHover(null)}
    >
      <group position={[0, L.origin, 0]}>{children}</group>
    </group>
  );
}

/** Balanço lento e parallax do ponteiro na cena inteira (independente do OrbitControls). */
function Sway({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const ry = Math.sin(t * 0.3) * 0.07 + state.pointer.x * 0.1;
    const rx = Math.sin(t * 0.23 + 1) * 0.015 - state.pointer.y * 0.035;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 2.5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 2.5, delta);
  });
  return <group ref={group}>{children}</group>;
}

/** Enquadramento responsivo cobrindo os dois dispositivos separados. */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const narrow = size.width < 760;
    camera.position.set(narrow ? 0.2 : 0.8, narrow ? 3.6 : 2.5, narrow ? 13.8 : 10.4);
    camera.lookAt(-0.15, 0.15, 0);
  }, [camera, size.width]);

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const p = easeInOutCubic(progressRef.current ?? 0);
    const goal = 1.25 - 0.2 * p;
    const next = THREE.MathUtils.damp(cam.zoom, goal, 3, delta);
    if (Math.abs(next - cam.zoom) > 0.0005) {
      cam.zoom = next;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

/* ========================================================================== */
/*  Cores e Materiais                                                         */
/* ========================================================================== */

const PVC = '#e2e8f0';
const PVC_DARK = '#b9c4d2';
const PVC_LIGHT = '#edf2f7';
const BRASS = '#c9a05c';
const BRASS_DARK = '#a07838';
const GREEN = '#16603c';
const GREEN_DARK = '#0b3a25';
const CHIP = '#12161d';
const METAL = '#c2cbd6';
const DARK_CASE = '#2d3748';
const DARK_CASE_2 = '#1a202c';

/* ========================================================================== */
/*  Realismo: texturas procedurais e passe de materiais                       */
/* ========================================================================== */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  pixelated = false,
) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (pixelated) {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }
  tex.needsUpdate = true;
  return tex;
}

/** Tela OLED 0.96" (128x64) com telemetria em fonte de pixels. */
function makeOledTexture() {
  return makeCanvasTexture(
    128,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = '#02050a';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#d6ecff';
      ctx.font = 'bold 10px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('W-GUARD', 3, 2);
      ctx.fillRect(3, 14, 122, 1);
      ctx.font = '9px monospace';
      ctx.fillText('Vazao  12.4 L/min', 3, 18);
      ctx.fillText('Total  1284 L', 3, 29);
      ctx.fillText('Bat    87 %', 3, 40);
      ctx.fillText('LoRa  -72 dBm', 3, 51);
      // ícone de sinal no canto
      [0, 1, 2, 3].forEach((i) => ctx.fillRect(108 + i * 4, 10 - i * 2, 2, 2 + i * 2));
    },
    true,
  );
}

/** Placa de circuito: máscara verde, trilhas, vias, furos e serigrafia. */
function makePcbTexture() {
  return makeCanvasTexture(1024, 652, (ctx, w, h) => {
    const rnd = seeded(7);
    ctx.fillStyle = '#0f4d2d';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i += 1) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},0.025)`;
      ctx.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 90; i += 1) {
      let x = rnd() * w;
      let y = rnd() * h;
      ctx.strokeStyle = rnd() > 0.5 ? '#17703f' : '#1b8049';
      ctx.lineWidth = 4 + Math.floor(rnd() * 3);
      ctx.beginPath();
      ctx.moveTo(x, y);
      const run = 60 + rnd() * 160;
      x += rnd() > 0.5 ? run : -run;
      ctx.lineTo(x, y);
      const d = 30 + rnd() * 60;
      x += d;
      y += rnd() > 0.5 ? d : -d;
      ctx.lineTo(x, y);
      ctx.lineTo(x + 40 + rnd() * 80, y);
      ctx.stroke();
    }
    // vias
    for (let i = 0; i < 160; i += 1) {
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.fillStyle = '#c9a05c';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a2b19';
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // fileiras de pinos (pads dourados)
    const pads = (x0: number, y0: number, n: number, dx: number, dy: number) => {
      for (let i = 0; i < n; i += 1) {
        const x = x0 + i * dx;
        const y = y0 + i * dy;
        ctx.fillStyle = '#d6b25f';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#071f12';
        ctx.beginPath();
        ctx.arc(x, y, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    pads(120, 70, 15, 26, 0);
    pads(120, 585, 15, 26, 0);
    pads(840, 150, 6, 0, 26);
    // furos de fixação
    [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]].forEach(([x, y]) => {
      ctx.fillStyle = '#c9a05c';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#04140b';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
    });
    // serigrafia
    ctx.strokeStyle = '#e9f0e9';
    ctx.fillStyle = '#e9f0e9';
    ctx.lineWidth = 3;
    ctx.strokeRect(150, 150, 330, 290);
    ctx.strokeRect(560, 210, 250, 190);
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('W-GUARD HYDRO  v1.0', 200, 505);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ESP32', 165, 178);
    ctx.fillText('TP4056', 575, 238);
    ctx.font = '16px sans-serif';
    ctx.fillText('BAT+  BAT-  OUT+  OUT-', 575, 425);
    ctx.fillText('GND  5V  3V3  D4  D5', 120, 60);
    ctx.fillText('FLOW', 800, 140);
    ctx.fillText('VALVE', 800, 330);
  });
}

/** Blindagem metálica escovada do módulo ESP32. */
function makeShieldTexture() {
  return makeCanvasTexture(256, 192, (ctx, w, h) => {
    const rnd = seeded(21);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#c7ccd3');
    g.addColorStop(0.5, '#aeb4bc');
    g.addColorStop(1, '#bfc5cc');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '40,45,55'},0.07)`;
      ctx.fillRect(0, rnd() * h, w, 1 + rnd() * 1.5);
    }
    ctx.fillStyle = '#2a2f37';
    ctx.font = 'bold 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESP-WROOM-32', w / 2, 82);
    ctx.font = '13px sans-serif';
    ctx.fillText('ESPRESSIF', w / 2, 108);
    ctx.fillText('FCC ID 2AC7Z-ESPWROOM32', w / 2, 128);
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        if (rnd() > 0.45) ctx.fillRect(18 + x * 6, 140 + y * 6, 5, 5);
      }
    }
  });
}

/**
 * Passe de materiais: tira o aspecto de "plástico de desenho".
 * - plásticos perdem o metal falso e ganham verniz leve (clearcoat);
 * - metais ganham reflexo mais forte e rugosidade mínima realista;
 * - peças luminosas (LEDs, telas) ficam como estão.
 */
function realify(mesh: THREE.Mesh) {
  if (mesh.userData.realified) return;
  mesh.userData.realified = true;
  const m = mesh.material;
  if (Array.isArray(m) || !(m instanceof THREE.MeshStandardMaterial)) return;
  if ((m as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) return;
  if (m.emissiveIntensity > 0.5 && m.emissive.getHex() !== 0) return;
  const next = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(next, m);
  if (m.metalness >= 0.5) {
    next.roughness = Math.max(next.roughness, 0.24);
    next.envMapIntensity = 1.35;
  } else {
    next.metalness = Math.min(next.metalness, 0.04);
    next.roughness = THREE.MathUtils.clamp(next.roughness, 0.3, 0.9);
    next.clearcoat = next.roughness < 0.5 ? 0.4 : 0.08;
    next.clearcoatRoughness = 0.35;
    next.envMapIntensity = 0.9;
  }
  mesh.material = next;
  m.dispose();
}

/* ========================================================================== */
/*  Corpo Hidráulico (Camada 01)                                              */
/* ========================================================================== */

function HydroBody() {
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 2, 48]} />
        <meshStandardMaterial color={PVC} roughness={0.35} metalness={0.08} />
      </mesh>
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x) => (
        <mesh key={`rib-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.325, 0.012, 8, 48]} />
          <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}

      {[-0.95, 0.95].map((x) => (
        <group key={`flange-${x}`} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 48]} />
            <meshStandardMaterial color={PVC_DARK} roughness={0.42} metalness={0.12} />
          </mesh>
          <mesh position={[x > 0 ? 0.1 : -0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.4, 0.04, 48]} />
            <meshStandardMaterial color={PVC_DARK} roughness={0.42} metalness={0.12} />
          </mesh>
          <mesh position={[x > 0 ? 0.12 : -0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.34, 0.018, 12, 48]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.0} />
          </mesh>
        </group>
      ))}

      {[-1.04, 1.04].map((x) => (
        <group key={`thread-${x}`}>
          <mesh position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.37, 0.022, 12, 48]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[x + (x > 0 ? 0.04 : -0.04), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.36, 0.015, 12, 48]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.36, 40]} />
        <meshStandardMaterial color={PVC} roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.24, 40]} />
        <meshStandardMaterial color={PVC_LIGHT} roughness={0.35} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 40]} />
        <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 40]} />
        <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.71, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.07, 40]} />
        <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.14} />
      </mesh>

      <group position={[-1.24, 0.04, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.44, 32]} />
          <meshStandardMaterial color={PVC_DARK} roughness={0.48} metalness={0.18} />
        </mesh>
        {[-0.15, 0.15].map((y) => (
          <mesh key={`vring-${y}`} position={[0, y, 0]}>
            <torusGeometry args={[0.245, 0.01, 8, 32]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.44, 0.26, 0.34]} />
          <meshStandardMaterial color={DARK_CASE} roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.3, 0.175]}>
          <boxGeometry args={[0.36, 0.18, 0.008]} />
          <meshStandardMaterial color={DARK_CASE_2} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 20]} />
          <meshStandardMaterial color={METAL} roughness={0.28} metalness={0.92} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color="#e53e3e" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      <group position={[1.2, 0.01, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.38, 32]} />
          <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.88} />
        </mesh>
        {[-0.12, 0, 0.12].map((x) => (
          <mesh key={`grib-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.285, 0.008, 8, 32]} />
            <meshStandardMaterial color={BRASS_DARK} roughness={0.35} metalness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.1, 24]} />
          <meshStandardMaterial color={DARK_CASE} roughness={0.55} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[0.22, 0.08, 0.18]} />
          <meshStandardMaterial color={DARK_CASE_2} roughness={0.55} metalness={0.4} />
        </mesh>
      </group>
    </>
  );
}

/* ========================================================================== */
/*  Sensores (Camada 02)                                                      */
/* ========================================================================== */

function SensorUnit() {
  return (
    <>
      <mesh>
        <cylinderGeometry args={[0.22, 0.24, 0.44, 32]} />
        <meshStandardMaterial color="#3a4658" roughness={0.45} metalness={0.3} />
      </mesh>
      {[-0.15, 0, 0.15].map((y) => (
        <mesh key={`srib-${y}`} position={[0, y, 0]}>
          <torusGeometry args={[0.225, 0.008, 8, 32]} />
          <meshStandardMaterial color="#2d3a4a" roughness={0.5} metalness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[0.32, 0.14, 0.32]} />
        <meshStandardMaterial color="#1a2332" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.28, 0.02, 0.28]} />
        <meshStandardMaterial color="#2d3a4a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.145, 0.025, 12, 40]} />
        <meshStandardMaterial color={BRASS} roughness={0.28} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 6]} />
        <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.8} transparent opacity={0.6} />
      </mesh>
      {[-0.36, -0.2].map((x) => (
        <group key={`elec-${x}`}>
          <mesh position={[x, -0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.02, 12]} />
            <meshStandardMaterial color={METAL} roughness={0.2} metalness={0.95} />
          </mesh>
          <mesh position={[x, 0.34, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 6]} />
            <meshStandardMaterial color={METAL} roughness={0.2} metalness={0.95} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.28, 0.4, 0]}>
        <boxGeometry args={[0.26, 0.035, 0.18]} />
        <meshStandardMaterial color={GREEN_DARK} roughness={0.7} />
      </mesh>
      <mesh position={[0.16, 0.42, 0.03]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.34, 10]} />
        <meshStandardMaterial color="#1b2433" roughness={0.85} />
      </mesh>
    </>
  );
}

/* ========================================================================== */
/*  Pack de Energia (Camada 03)                                               */
/* ========================================================================== */

function PowerPack() {
  return (
    <>
      {[-0.19, 0.19].map((z) => (
        <group key={`bat-${z}`} position={[0, 0, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.86, 32]} />
            <meshStandardMaterial color="#274a6d" roughness={0.42} metalness={0.35} />
          </mesh>
          {[-0.43, 0.43].map((x) => (
            <mesh key={`term-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.152, 0.152, 0.04, 32]} />
              <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.92} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0.48, 0.09, 0.36]}>
        <boxGeometry args={[0.4, 0.03, 0.26]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
      </mesh>
      <mesh position={[0.52, 0.13, 0.36]}>
        <boxGeometry args={[0.1, 0.05, 0.09]} />
        <meshStandardMaterial color={CHIP} roughness={0.5} />
      </mesh>
      <mesh position={[-0.55, 0.04, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 10]} />
        <meshStandardMaterial color="#c0392b" roughness={0.85} />
      </mesh>
      <mesh position={[-0.55, 0.04, -0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 10]} />
        <meshStandardMaterial color="#111827" roughness={0.85} />
      </mesh>
    </>
  );
}

/* ========================================================================== */
/*  PCB do Hidrômetro (Camada 04)                                             */
/* ========================================================================== */

function PCBoard() {
  const pcbTex = useMemo(() => makePcbTexture(), []);
  const shieldTex = useMemo(() => makeShieldTexture(), []);
  return (
    <>
      <mesh>
        <boxGeometry args={[1.35, 0.05, 0.86]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.0262, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.35, 0.86]} />
        <meshPhysicalMaterial
          map={pcbTex}
          roughness={0.38}
          metalness={0.02}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      <group position={[-0.3, 0.06, 0]}>
        <mesh>
          <boxGeometry args={[0.52, 0.06, 0.28]} />
          <meshStandardMaterial color="#0d1117" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[-0.06, 0.055, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.16]} />
          <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.95} />
        </mesh>
        <mesh position={[-0.06, 0.0706, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 0.16]} />
          <meshStandardMaterial map={shieldTex} roughness={0.32} metalness={0.9} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[-0.22, 0.045, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0.28, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.04, 0.08]} />
          <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      <group position={[0.34, 0.055, 0.14]}>
        <mesh>
          <boxGeometry args={[0.3, 0.045, 0.22]} />
          <meshStandardMaterial color="#12503a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.15, 0.03, 0.13]} />
          <meshStandardMaterial color={METAL} roughness={0.28} metalness={0.95} />
        </mesh>
      </group>

      {[-0.32, 0.26].map((z) => (
        <group key={`born-${z}`} position={[0.52, 0.08, z]}>
          <mesh>
            <boxGeometry args={[0.14, 0.12, 0.2]} />
            <meshStandardMaterial color="#1e40af" roughness={0.6} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.52, 0.07, -0.3]}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 16]} />
        <meshStandardMaterial color="#e5b95c" roughness={0.25} metalness={0.95} />
      </mesh>

      {['#22d3ee', '#34d399', '#fbbf24'].map((color, index) => (
        <mesh key={color} position={[-0.55 + index * 0.08, 0.045, -0.34]}>
          <boxGeometry args={[0.045, 0.028, 0.045]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* ========================================================================== */
/*  Cúpula de Proteção (Camada 05)                                            */
/* ========================================================================== */

function DomeCap() {
  return (
    <>
      <mesh>
        <cylinderGeometry args={[0.79, 0.82, 0.12, 56]} />
        <meshStandardMaterial color="#e9eef5" roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.78, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#cfe6f2"
          roughness={0.08}
          metalness={0}
          transmission={0.88}
          thickness={0.22}
          ior={1.45}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.016, 12, 48]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      <group position={[0.46, 0.2, 0.14]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.016, 0.012, 0.5, 12]} />
          <meshStandardMaterial color="#1b2433" roughness={0.45} metalness={0.6} />
        </mesh>
      </group>
    </>
  );
}

/* ========================================================================== */
/*  Módulo Receptor LoRa com EXPLOSÃO INTERNA COMPLETA (Camada 06)            */
/* ========================================================================== */

function LoraModule({ progressRef }: { progressRef: RefObject<number> }) {
  const CASE_COLOR = '#2d3748';
  const CASE_INNER = '#1a202c';
  const CASE_FRONT = '#3d4a5c';
  const oledTex = useMemo(() => makeOledTexture(), []);

  // Subgrupos explodidos do LoRa
  const frontBezelRef = useRef<THREE.Group>(null);
  const oledRef = useRef<THREE.Group>(null);
  const loraBoardRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);
  const batteriesRef = useRef<THREE.Group>(null);
  const backDoorRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    const p = progressRef.current ?? 0;

    // 1. Moldura frontal com chanfro e logo -> salta para a FRENTE (+Z)
    if (frontBezelRef.current) {
      frontBezelRef.current.position.z = THREE.MathUtils.damp(
        frontBezelRef.current.position.z,
        0.3 + 0.85 * p,
        6,
        delta
      );
    }

    // 2. Display OLED 0.96" -> destaca-se para frente e sobe ligeiramente (+Z, +Y)
    if (oledRef.current) {
      oledRef.current.position.z = THREE.MathUtils.damp(oledRef.current.position.z, 0.34 + 0.55 * p, 6, delta);
      oledRef.current.position.y = THREE.MathUtils.damp(oledRef.current.position.y, 0.35 + 0.22 * p, 6, delta);
    }

    // 3. Módulo LoRa SX1278 -> destaca-se para frente e lado (+Z, -X)
    if (loraBoardRef.current) {
      loraBoardRef.current.position.z = THREE.MathUtils.damp(
        loraBoardRef.current.position.z,
        0.34 + 0.42 * p,
        6,
        delta
      );
      loraBoardRef.current.position.x = THREE.MathUtils.damp(
        loraBoardRef.current.position.x,
        -0.15 - 0.18 * p,
        6,
        delta
      );
    }

    // 4. Botão e LED -> saltam para frente (+Z)
    if (controlsRef.current) {
      controlsRef.current.position.z = THREE.MathUtils.damp(
        controlsRef.current.position.z,
        0.34 + 0.68 * p,
        6,
        delta
      );
    }

    // 5. Antena SMA dipolo -> sobe verticalmente (+Y)
    if (antennaRef.current) {
      antennaRef.current.position.y = THREE.MathUtils.damp(antennaRef.current.position.y, 0.76 + 0.55 * p, 6, delta);
    }

    // 6. Baterias 18650 azuis -> saem para TRÁS (-Z)
    if (batteriesRef.current) {
      batteriesRef.current.position.z = THREE.MathUtils.damp(
        batteriesRef.current.position.z,
        -0.2 - 0.55 * p,
        6,
        delta
      );
    }

    // 7. Tampa/porta traseira do compartimento -> sai ainda mais para TRÁS (-Z)
    if (backDoorRef.current) {
      backDoorRef.current.position.z = THREE.MathUtils.damp(
        backDoorRef.current.position.z,
        -0.35 - 0.95 * p,
        6,
        delta
      );
    }
  });

  return (
    <group>
      {/* ---------------- 1. Gabinete Central (Chassis com Abas de Parede) ---------------- */}
      <group>
        {/* Caixa principal sólida */}
        <RoundedBox args={[1.15, 1.5, 0.62]} radius={0.04} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color={CASE_COLOR} roughness={0.55} metalness={0.3} />
        </RoundedBox>

        {/* Fundo do nicho frontal interno onde a eletrônica fica assentada */}
        <mesh position={[0, 0.05, 0.28]}>
          <boxGeometry args={[0.96, 1.25, 0.05]} />
          <meshStandardMaterial color={CASE_INNER} roughness={0.65} metalness={0.25} />
        </mesh>

        {/* Abas superiores com furos de fixação na parede */}
        {[-0.43, 0.43].map((x) => (
          <group key={`tab-${x}`} position={[x, 0.88, 0]}>
            <RoundedBox args={[0.2, 0.24, 0.14]} radius={0.03} smoothness={2}>
              <meshStandardMaterial color={CASE_COLOR} roughness={0.55} metalness={0.3} />
            </RoundedBox>
            <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.045, 0.012, 8, 20]} />
              <meshStandardMaterial color={DARK_CASE_2} roughness={0.5} metalness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Barra superior de reforço entre as abas */}
        <mesh position={[0, 0.84, -0.1]}>
          <boxGeometry args={[0.66, 0.08, 0.1]} />
          <meshStandardMaterial color={CASE_COLOR} roughness={0.55} metalness={0.3} />
        </mesh>

        {/* Conector USB lateral de carga/comunicação */}
        <group position={[0.59, -0.3, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.04, 0.06, 0.1]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ---------------- 2. Moldura Frontal Chanfrada (EXPLODE PARA FRENTE) ---------------- */}
      <group ref={frontBezelRef} position={[0, 0, 0.3]}>
        {/* Borda superior */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.04, 0.08, 0.05]} />
          <meshStandardMaterial color={CASE_FRONT} roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Borda inferior com o logo W-Guard */}
        <group position={[0, -0.62, 0]}>
          <mesh>
            <boxGeometry args={[1.04, 0.22, 0.05]} />
            <meshStandardMaterial color={CASE_FRONT} roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Logo W-Guard em verde emissivo */}
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.36, 0.08, 0.005]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.6}
              roughness={0.4}
              toneMapped={false}
            />
          </mesh>
          {/* Brasão estilizado */}
          <mesh position={[0, 0.07, 0.03]}>
            <cylinderGeometry args={[0.05, 0.05, 0.006, 6]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.8}
              roughness={0.4}
              toneMapped={false}
            />
          </mesh>
        </group>
        {/* Laterais com chanfro */}
        {[-0.51, 0.51].map((x) => (
          <mesh key={`flank-${x}`} position={[x, 0.05, 0]}>
            <boxGeometry args={[0.07, 1.34, 0.05]} />
            <meshStandardMaterial color={CASE_FRONT} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ---------------- 3. Display OLED 0.96" (EXPLODE EM DIAGONAL) ---------------- */}
      <group ref={oledRef} position={[0.05, 0.35, 0.34]}>
        <mesh>
          <boxGeometry args={[0.5, 0.32, 0.03]} />
          <meshStandardMaterial color="#0a0e14" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Tela OLED */}
        <mesh position={[0, 0.02, 0.018]}>
          <boxGeometry args={[0.4, 0.22, 0.003]} />
          <meshStandardMaterial color="#001122" roughness={0.1} metalness={0.3} />
        </mesh>
        {/* Imagem da tela: telemetria em fonte de pixels, tela autoluminosa */}
        <mesh position={[0, 0.02, 0.0205]}>
          <planeGeometry args={[0.38, 0.19]} />
          <meshBasicMaterial map={oledTex} toneMapped={false} />
        </mesh>
        {/* Pinos I2C superiores */}
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.02]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* ---------------- 4. Módulo LoRa SX1278 (EXPLODE PARA O LADO) ---------------- */}
      <group ref={loraBoardRef} position={[-0.15, -0.1, 0.34]}>
        <mesh>
          <boxGeometry args={[0.34, 0.26, 0.025]} />
          <meshStandardMaterial color="#12503a" roughness={0.6} />
        </mesh>
        {/* Blindagem metálica prateada do transceptor */}
        <mesh position={[0.02, 0.02, 0.02]}>
          <boxGeometry args={[0.18, 0.14, 0.025]} />
          <meshStandardMaterial color={METAL} roughness={0.28} metalness={0.95} />
        </mesh>
        {/* Cristal oscilador */}
        <mesh position={[-0.09, -0.04, 0.02]}>
          <boxGeometry args={[0.04, 0.025, 0.015]} />
          <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Pinos header de comunicação */}
        <mesh position={[0, -0.13, 0]}>
          <boxGeometry args={[0.32, 0.015, 0.03]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* ---------------- 5. Botões e LED de Status (EXPLODE FRONTAL) ---------------- */}
      <group ref={controlsRef} position={[0.3, -0.15, 0.34]}>
        {/* Botão de comando */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#4a5568" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0.02]}>
          <cylinderGeometry args={[0.026, 0.026, 0.01, 12]} />
          <meshStandardMaterial color="#2d3748" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* LED indicador de status */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.02, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>

      {/* ---------------- 6. Antena Dipolo LoRa (EXPLODE PARA CIMA) ---------------- */}
      <group ref={antennaRef} position={[0.35, 0.76, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          <meshStandardMaterial color="#e5b95c" roughness={0.25} metalness={0.95} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.014, 0.011, 0.52, 10]} />
          <meshStandardMaterial color="#1b2433" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.59, 0]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#1b2433" roughness={0.45} metalness={0.6} />
        </mesh>
      </group>

      {/* ---------------- 7. Pack de Baterias 18650 Traseiro (EXPLODE PARA TRÁS) ---------------- */}
      <group ref={batteriesRef} position={[0, -0.42, -0.2]}>
        {/* Alojamento interno */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[0.94, 0.48, 0.08]} />
          <meshStandardMaterial color={CASE_INNER} roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Duas células Li-Ion 18650 azuis */}
        {[-0.12, 0.12].map((y) => (
          <group key={`lbat-${y}`} position={[0, y, -0.04]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.095, 0.095, 0.76, 24]} />
              <meshStandardMaterial color="#1d6bb5" roughness={0.38} metalness={0.35} />
            </mesh>
            {[-0.38, 0.38].map((x) => (
              <mesh key={`lt-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.097, 0.097, 0.02, 24]} />
                <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.92} />
              </mesh>
            ))}
            <mesh position={[0.39, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.038, 0.015, 12]} />
              <meshStandardMaterial color={METAL} roughness={0.2} metalness={0.95} />
            </mesh>
          </group>
        ))}
        {/* Molas e clips dos contatos */}
        {[-0.41, 0.41].map((x) => (
          <mesh key={`lclip-${x}`} position={[x, 0, -0.04]}>
            <boxGeometry args={[0.03, 0.42, 0.16]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ---------------- 8. Tampa do Compartimento Traseiro (EXPLODE MAIS PARA TRÁS) ---------------- */}
      <group ref={backDoorRef} position={[0, -0.42, -0.35]}>
        <mesh>
          <boxGeometry args={[0.96, 0.5, 0.02]} />
          <meshPhysicalMaterial
            color="#a0c4d8"
            roughness={0.15}
            transmission={0.65}
            thickness={0.08}
            transparent
            opacity={0.65}
          />
        </mesh>
        {/* Frisos da tampa */}
        {[-0.15, 0, 0.15].map((y) => (
          <mesh key={`doorrib-${y}`} position={[0, y, -0.012]}>
            <boxGeometry args={[0.88, 0.015, 0.008]} />
            <meshStandardMaterial color={CASE_FRONT} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ========================================================================== */
/*  Enlace de Rádio LoRa (Conexão visual entre o hidrômetro e o módulo LoRa)  */
/* ========================================================================== */

function LoraLink({ progressRef }: { progressRef: RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const dash = useRef(0);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    const p = progressRef.current ?? 0;
    ref.current.visible = p > 0.1;
    ref.current.scale.setScalar(Math.min(1, Math.max(0, (p - 0.1) / 0.3)));
    dash.current += delta;
  });

  return (
    <group ref={ref} visible={false}>
      {/* Arcos de sinal LoRa 433 MHz viajando no espaço entre os 2 módulos */}
      {[0.4, 0.7, 1.0, 1.3].map((rad, i) => (
        <mesh
          key={`wave-${i}`}
          position={[-0.3, 0.5, 0.1]}
          rotation={[0, 0, -Math.PI / 2]}
        >
          <torusGeometry args={[rad, 0.012, 8, 32, Math.PI / 1.8]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#f472b6"
            emissiveIntensity={1.8 - i * 0.3}
            transparent
            opacity={0.7 - i * 0.12}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ========================================================================== */
/*  Composição Final dos Dispositivos Separados                               */
/* ========================================================================== */

function Meter({
  selected,
  onSelect,
  onHover,
  hovered,
  progressRef,
}: {
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId) => void;
  onHover: (id: MeterPartId | null) => void;
  hovered: MeterPartId | null;
  progressRef: RefObject<number>;
}) {
  const shared = { onSelect, onHover, progressRef };

  return (
    <group scale={0.84}>
      {/* ==================== DISPOSITIVO 1: HIDRÔMETRO INTELIGENTE (DIREITA) ==================== */}
      <Part {...shared} id="body" active={hovered === 'body'} selected={selected === 'body'}>
        <HydroBody />
      </Part>

      <Part {...shared} id="sensor" active={hovered === 'sensor'} selected={selected === 'sensor'}>
        <SensorUnit />
      </Part>

      <Part {...shared} id="power" active={hovered === 'power'} selected={selected === 'power'}>
        <PowerPack />
      </Part>

      <Part {...shared} id="pcb" active={hovered === 'pcb'} selected={selected === 'pcb'}>
        <PCBoard />
      </Part>

      <Part {...shared} id="cap" active={hovered === 'cap'} selected={selected === 'cap'}>
        <DomeCap />
      </Part>

      {/* ==================== DISPOSITIVO 2: MÓDULO RECEPTOR LoRa (ESQUERDA) ==================== */}
      <Part {...shared} id="lora" active={hovered === 'lora'} selected={selected === 'lora'}>
        <LoraModule progressRef={progressRef} />
      </Part>

      {/* Enlace sem fio LoRa entre o hidrômetro e o módulo receptor */}
      <LoraLink progressRef={progressRef} />
    </group>
  );
}

/** Se o .glb não carregar, volta para a versão desenhada em código em vez de derrubar a cena. */
class GlbBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Mesmos aparelhos, com as peças vindas do modelo do Blender. */
function GlbMeter({
  selected,
  onSelect,
  onHover,
  hovered,
  progressRef,
}: {
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId) => void;
  onHover: (id: MeterPartId | null) => void;
  hovered: MeterPartId | null;
  progressRef: RefObject<number>;
}) {
  const shared = { onSelect, onHover, progressRef };
  const ids: MeterPartId[] = ['body', 'sensor', 'power', 'pcb', 'cap', 'lora'];
  return (
    <group scale={0.84}>
      {ids.map((id) => (
        <Part key={id} {...shared} id={id} layout={GLB_LAYOUT[id]} active={hovered === id} selected={selected === id}>
          <GlbNode id={id} />
        </Part>
      ))}
      <LoraLink progressRef={progressRef} />
    </group>
  );
}

type MeterSceneProps = {
  theme: 'light' | 'dark';
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId) => void;
  progressRef: RefObject<number>;
};

export default function MeterScene({ theme, selected, onSelect, progressRef }: MeterSceneProps) {
  const [hovered, setHovered] = useState<MeterPartId | null>(null);
  const dark = theme === 'dark';
  const fallbackMeter = (
    <Meter selected={selected} onSelect={onSelect} onHover={setHovered} hovered={hovered} progressRef={progressRef} />
  );

  return (
    <Canvas
      dpr={[1, 2]}
      shadows="soft"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0.8, 2.5, 10.4], fov: 37, near: 0.1, far: 60 }}
    >
      <CameraRig progressRef={progressRef} />

      <ambientLight intensity={dark ? 0.4 : 0.65} />
      <directionalLight
        position={[6, 9, 6]}
        intensity={dark ? 2.4 : 2.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-6, 5, -4]} intensity={dark ? 1.0 : 0.6} color="#dbe7ff" />
      <directionalLight position={[0, 2, 8]} intensity={dark ? 0.35 : 0.25} color="#fff4e6" />

      <group position={[0, -0.1, 0]}>
        <Sway>
          {/* Enquanto o .glb carrega (ou se falhar), mostra a versão desenhada em código. */}
          <GlbBoundary fallback={fallbackMeter}>
            <Suspense fallback={fallbackMeter}>
              <GlbMeter
                selected={selected}
                onSelect={onSelect}
                onHover={setHovered}
                hovered={hovered}
                progressRef={progressRef}
              />
            </Suspense>
          </GlbBoundary>
        </Sway>
        <ContactShadows
          position={[0, -1.72, 0]}
          opacity={dark ? 0.55 : 0.32}
          scale={16}
          blur={2.8}
          far={4.4}
          color={dark ? '#000000' : '#334155'}
        />
      </group>

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={dark ? 4.5 : 6} position={[0, 6, 4]} scale={[14, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={dark ? 2 : 2.8} position={[-6, 2, 2]} scale={[3, 8, 1]} color="#fff1e0" />
        <Lightformer form="rect" intensity={dark ? 1.8 : 2.4} position={[6, 1, -2]} scale={[3, 8, 1]} color="#e0ecff" />
        <Lightformer form="rect" intensity={dark ? 1.2 : 1.8} position={[0, 1, -7]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={dark ? 2.2 : 3} position={[0, -4, 0]} scale={8} color="#e2e8f0" />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 7) / 12}
        target={[-0.2, 0.1, 0]}
      />
    </Canvas>
  );
}
