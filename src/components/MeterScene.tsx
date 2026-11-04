import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import type { MeterPartId } from '../data/meter';

/** Altura de repouso de cada camada (dispositivo montado). */
const BASE_Y: Record<MeterPartId, number> = {
  body: -1.15,
  sensor: -0.41,
  power: 0.205,
  pcb: 0.545,
  cap: 0.745,
};

/** Deslocamento interno que coloca a origem de cada camada na sua base. */
const ORIGIN_OFFSET: Record<MeterPartId, number> = {
  body: 0,
  sensor: 0.22,
  power: 0.17,
  pcb: 0.025,
  cap: 0.06,
};

/** Deslocamento aplicado quando a vista está 100% explodida. */
const EXPLODE: Record<MeterPartId, [number, number, number]> = {
  body: [0, -0.5, 0],
  sensor: [0.4, -0.3, 0.2],
  power: [-0.34, 0.46, -0.12],
  pcb: [0.05, 0.96, 0.05],
  cap: [0.16, 1.46, 0.12],
};

const ACCENT: Record<MeterPartId, string> = {
  cap: '#38bdf8',
  pcb: '#34d399',
  power: '#fbbf24',
  sensor: '#22d3ee',
  body: '#a78bfa',
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
    const base = BASE_Y[id];
    const offset = EXPLODE[id];
    target.set(offset[0] * p, base + offset[1] * p, offset[2] * p);
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
      position={[0, BASE_Y[id], 0]}
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

/** Enquadramento responsivo + dolly-out suave conforme a pilha se abre. */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const { camera, size } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;

  useEffect(() => {
    const narrow = size.width < 760;
    camera.position.set(narrow ? 6.4 : 4.6, narrow ? 3.1 : 2.1, narrow ? 11.6 : 8.9);
    camera.lookAt(0, 0.25, 0);
  }, [camera, size.width]);

  useFrame((_state, delta) => {
    const p = progressRef.current ?? 0;
    const goal = 1.5 - 0.26 * p;
    const next = THREE.MathUtils.damp(perspective.zoom, goal, 4, delta);
    if (Math.abs(next - perspective.zoom) > 0.0005) {
      perspective.zoom = next;
      perspective.updateProjectionMatrix();
    }
  });
  return null;
}

const PVC = '#dbe2ea';
const PVC_DARK = '#b9c4d2';
const BRASS = '#c9a05c';
const GREEN = '#16603c';
const GREEN_DARK = '#0b3a25';
const CHIP = '#12161d';
const METAL = '#c2cbd6';

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
    <group scale={0.86}>
      {/* ------------------------------------------------ corpo hidráulico */}
      <Part {...shared} id="body" active={hovered === 'body'} selected={selected === 'body'}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 2, 48]} />
          <meshStandardMaterial color={PVC} roughness={0.42} metalness={0.1} />
        </mesh>
        {[-0.95, 0.95].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.39, 0.39, 0.18, 48]} />
            <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.12} />
          </mesh>
        ))}
        {[-1.04, 1.04].map((x) => (
          <mesh key={`ring-${x}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.37, 0.022, 12, 48]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        {/* câmara de medição */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.56, 40]} />
          <meshStandardMaterial color={PVC} roughness={0.42} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.71, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.07, 40]} />
          <meshStandardMaterial color={PVC_DARK} roughness={0.5} metalness={0.14} />
        </mesh>
        {/* válvula motorizada */}
        <group position={[-1.24, 0.04, 0]}>
          <mesh>
            <cylinderGeometry args={[0.24, 0.24, 0.44, 32]} />
            <meshStandardMaterial color={PVC_DARK} roughness={0.48} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.42, 0.3, 0.32]} />
            <meshStandardMaterial color="#2b3546" roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.09, 20]} />
            <meshStandardMaterial color={METAL} roughness={0.28} metalness={0.92} />
          </mesh>
        </group>
        {/* minigerador inline */}
        <group position={[1.2, 0.01, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.38, 32]} />
            <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.88} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.26, 0.16, 0.22]} />
            <meshStandardMaterial color="#243144" roughness={0.55} metalness={0.4} />
          </mesh>
        </group>
      </Part>

      {/* ------------------------------------------------------- sensores */}
      <Part {...shared} id="sensor" active={hovered === 'sensor'} selected={selected === 'sensor'}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.44, 32]} />
          <meshStandardMaterial color="#3a4658" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <boxGeometry args={[0.3, 0.17, 0.3]} />
          <meshStandardMaterial color="#20293a" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.145, 0.025, 12, 40]} />
          <meshStandardMaterial color={BRASS} roughness={0.28} metalness={0.9} />
        </mesh>
        {/* eletrodos de condutividade */}
        {[-0.36, -0.2].map((x) => (
          <mesh key={x} position={[x, -0.18, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 1.02, 12]} />
            <meshStandardMaterial color={METAL} roughness={0.2} metalness={0.95} />
          </mesh>
        ))}
        <mesh position={[-0.28, 0.4, 0]}>
          <boxGeometry args={[0.26, 0.035, 0.18]} />
          <meshStandardMaterial color={GREEN_DARK} roughness={0.7} />
        </mesh>
        {/* chicote do sensor */}
        <mesh position={[0.16, 0.42, 0.03]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.34, 10]} />
          <meshStandardMaterial color="#1b2433" roughness={0.85} />
        </mesh>
      </Part>

      {/* ------------------------------------------------------- energia */}
      <Part {...shared} id="power" active={hovered === 'power'} selected={selected === 'power'}>
        {[-0.19, 0.19].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.86, 32]} />
              <meshStandardMaterial color="#274a6d" roughness={0.42} metalness={0.35} />
            </mesh>
            {[-0.43, 0.43].map((x) => (
              <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
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
      </Part>

      {/* ---------------------------------------------------------- PCB */}
      <Part {...shared} id="pcb" active={hovered === 'pcb'} selected={selected === 'pcb'}>
        <mesh>
          <boxGeometry args={[1.35, 0.05, 0.86]} />
          <meshStandardMaterial color={GREEN} roughness={0.5} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.028, 0]}>
          <boxGeometry args={[1.28, 0.004, 0.79]} />
          <meshStandardMaterial color={GREEN_DARK} roughness={0.62} />
        </mesh>
        {/* ESP32 DevKit */}
        <mesh position={[-0.3, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.28]} />
          <meshStandardMaterial color="#0d1117" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[-0.36, 0.165, 0]}>
          <boxGeometry args={[0.22, 0.025, 0.16]} />
          <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.95} />
        </mesh>
        {[-0.15, 0.15].map((z) => (
          <mesh key={z} position={[-0.3, 0.048, z]}>
            <boxGeometry args={[0.54, 0.018, 0.045]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        {/* SX1278 */}
        <group position={[0.34, 0.055, 0.14]}>
          <mesh>
            <boxGeometry args={[0.3, 0.045, 0.22]} />
            <meshStandardMaterial color="#12503a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.15, 0.035, 0.13]} />
            <meshStandardMaterial color={METAL} roughness={0.28} metalness={0.95} />
          </mesh>
        </group>
        {/* borneras */}
        {[-0.32, 0.26].map((z) => (
          <mesh key={z} position={[0.52, 0.08, z]}>
            <boxGeometry args={[0.14, 0.12, 0.2]} />
            <meshStandardMaterial color="#1e40af" roughness={0.6} />
          </mesh>
        ))}
        {/* conector de antena */}
        <mesh position={[0.52, 0.07, -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
          <meshStandardMaterial color="#e5b95c" roughness={0.25} metalness={0.95} />
        </mesh>
        {['#22d3ee', '#34d399', '#fbbf24'].map((color, index) => (
          <mesh key={color} position={[-0.55 + index * 0.08, 0.045, -0.34]}>
            <boxGeometry args={[0.045, 0.028, 0.045]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        ))}
        {[0.05, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.09, -0.31]}>
            <cylinderGeometry args={[0.045, 0.045, 0.1, 18]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
      </Part>

      {/* --------------------------------------------------------- cúpula */}
      <Part {...shared} id="cap" active={hovered === 'cap'} selected={selected === 'cap'}>
        <mesh>
          <cylinderGeometry args={[0.79, 0.82, 0.12, 56]} />
          <meshStandardMaterial color="#e9eef5" roughness={0.35} metalness={0.08} />
        </mesh>
        {/* cúpula de policarbonato */}
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
        {/* anel de status e visor */}
        <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.016, 12, 48]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.015, 32]} />
          <meshStandardMaterial color="#0b1424" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* antena */}
        <mesh position={[0.46, 0.2, 0.14]}>
          <cylinderGeometry args={[0.045, 0.045, 0.1, 16]} />
          <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0.46, 0.5, 0.14]}>
          <cylinderGeometry args={[0.016, 0.016, 0.5, 12]} />
          <meshStandardMaterial color="#1b2433" roughness={0.45} metalness={0.6} />
        </mesh>
        {/* parafusos */}
        {[[-0.62, -0.52], [0.62, -0.52], [-0.62, 0.52], [0.62, 0.52]].map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x, 0.07, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.045, 12]} />
            <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
      </Part>
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
      camera={{ position: [4.6, 2.1, 8.9], fov: 36, near: 0.1, far: 60 }}
    >
      <CameraRig progressRef={progressRef} />

      <ambientLight intensity={dark ? 0.5 : 0.95} />
      <directionalLight position={[5, 9, 6]} intensity={dark ? 2.2 : 2.4} color="#ffffff" />
      <directionalLight position={[-6, 4, -4]} intensity={dark ? 1.2 : 0.65} color={dark ? '#38bdf8' : '#bfdbfe'} />
      <pointLight position={[0, -2.4, 3]} intensity={dark ? 10 : 5} color="#14b8a6" distance={12} />

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
          scale={11}
          blur={2.8}
          far={4.4}
          color={dark ? '#000000' : '#334155'}
        />
      </group>

      <Environment resolution={96}>
        <Lightformer form="rect" intensity={dark ? 5 : 7} position={[0, 6, 4]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={dark ? 2.4 : 3.4} position={[-5, 2, 2]} scale={[6, 6, 1]} color="#5eead4" />
        <Lightformer form="rect" intensity={dark ? 2 : 2.6} position={[5, 1, -2]} scale={[6, 6, 1]} color="#60a5fa" />
        <Lightformer form="ring" intensity={dark ? 3 : 4} position={[0, -4, 0]} scale={6} color="#e2e8f0" />
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
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}
