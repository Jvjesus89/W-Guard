import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox, useCursor } from '@react-three/drei';
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

const ACCENT: Record<MeterPartId, string> = {
  cap: '#38bdf8',
  pcb: '#34d399',
  power: '#fbbf24',
  sensor: '#22d3ee',
  body: '#a78bfa',
  lora: '#f472b6',
};

type PartProps = {
  id: MeterPartId;
  active: boolean;
  selected: boolean;
  onSelect: (id: MeterPartId) => void;
  onHover: (id: MeterPartId | null) => void;
  progressRef: RefObject<number>;
  children: ReactNode;
};

/** Camada do dispositivo: anima a explosão e destaca a peça sob o cursor. */
function Part({ id, active, selected, onSelect, onHover, progressRef, children }: PartProps) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const accent = ACCENT[id];

  useCursor(active);

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

  useFrame((_state, delta) => {
    const root = group.current;
    if (!root) return;
    const p = progressRef.current ?? 0;
    const base = BASE_POS[id];
    const offset = EXPLODE_OFFSET[id];
    target.set(base[0] + offset[0] * p, base[1] + offset[1] * p, base[2] + offset[2] * p);
    root.position.x = THREE.MathUtils.damp(root.position.x, target.x, 6, delta);
    root.position.y = THREE.MathUtils.damp(root.position.y, target.y, 6, delta);
    root.position.z = THREE.MathUtils.damp(root.position.z, target.z, 6, delta);
    const scale = selected ? 1.035 : active ? 1.015 : 1;
    const next = THREE.MathUtils.damp(root.scale.x, scale, 8, delta);
    root.scale.setScalar(next);
  });

  return (
    <group
      ref={group}
      position={BASE_POS[id]}
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
      <group position={[0, ORIGIN_OFFSET[id], 0]}>{children}</group>
    </group>
  );
}

/** Enquadramento responsivo cobrindo os dois dispositivos separados. */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const { camera, size } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;

  useEffect(() => {
    const narrow = size.width < 760;
    camera.position.set(narrow ? 0.2 : 0.8, narrow ? 3.6 : 2.5, narrow ? 13.8 : 10.4);
    camera.lookAt(-0.15, 0.15, 0);
  }, [camera, size.width]);

  useFrame((_state, delta) => {
    const p = progressRef.current ?? 0;
    const goal = 1.25 - 0.2 * p;
    const next = THREE.MathUtils.damp(perspective.zoom, goal, 4, delta);
    if (Math.abs(next - perspective.zoom) > 0.0005) {
      perspective.zoom = next;
      perspective.updateProjectionMatrix();
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
  return (
    <>
      <mesh>
        <boxGeometry args={[1.35, 0.05, 0.86]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[1.28, 0.004, 0.79]} />
        <meshStandardMaterial color={GREEN_DARK} roughness={0.62} />
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
        {/* Linhas simuladas de telemetria em verde neon */}
        {[-0.06, -0.02, 0.02, 0.06].map((y, i) => (
          <mesh key={`px-${i}`} position={[-0.04 + i * 0.02, y, 0.021]}>
            <boxGeometry args={[0.2 - i * 0.03, 0.015, 0.002]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}
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

type MeterSceneProps = {
  theme: 'light' | 'dark';
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId) => void;
  progressRef: RefObject<number>;
};

export default function MeterScene({ theme, selected, onSelect, progressRef }: MeterSceneProps) {
  const [hovered, setHovered] = useState<MeterPartId | null>(null);
  const dark = theme === 'dark';

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0.8, 2.5, 10.4], fov: 37, near: 0.1, far: 60 }}
    >
      <CameraRig progressRef={progressRef} />

      <ambientLight intensity={dark ? 0.55 : 0.95} />
      <directionalLight position={[6, 9, 6]} intensity={dark ? 2.4 : 2.6} color="#ffffff" />
      <directionalLight position={[-6, 5, -4]} intensity={dark ? 1.4 : 0.8} color={dark ? '#f472b6' : '#bfdbfe'} />
      <pointLight position={[1.2, -2.4, 3]} intensity={dark ? 10 : 5} color="#14b8a6" distance={12} />
      <pointLight position={[-2, 1, 3]} intensity={dark ? 8 : 4} color="#f472b6" distance={10} />

      <group position={[0, -0.1, 0]}>
        <Meter
          selected={selected}
          onSelect={onSelect}
          onHover={setHovered}
          hovered={hovered}
          progressRef={progressRef}
        />
        <ContactShadows
          position={[0, -1.72, 0]}
          opacity={dark ? 0.55 : 0.32}
          scale={16}
          blur={2.8}
          far={4.4}
          color={dark ? '#000000' : '#334155'}
        />
      </group>

      <Environment resolution={96}>
        <Lightformer form="rect" intensity={dark ? 5 : 7} position={[0, 6, 4]} scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={dark ? 2.4 : 3.4} position={[-5, 2, 2]} scale={[6, 6, 1]} color="#f472b6" />
        <Lightformer form="rect" intensity={dark ? 2 : 2.6} position={[5, 1, -2]} scale={[6, 6, 1]} color="#60a5fa" />
        <Lightformer form="ring" intensity={dark ? 3 : 4} position={[0, -4, 0]} scale={8} color="#e2e8f0" />
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
