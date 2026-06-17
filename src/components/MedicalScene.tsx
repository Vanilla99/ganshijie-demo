import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type MedicalSceneProps = {
  showLiver?: boolean;
  showTumor?: boolean;
  showVessel?: boolean;
  autoRotate?: boolean;
  compact?: boolean;
  liverOpacity?: number;
};

type VesselProps = {
  points: THREE.Vector3[];
  color: string;
  radius?: number;
};

type LiverModelProps = Required<Pick<MedicalSceneProps, "showLiver" | "showTumor" | "showVessel" | "autoRotate" | "liverOpacity">>;

function Vessel({ points, color, radius = 0.025 }: VesselProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 72, radius, 12, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} roughness={0.38} />
    </mesh>
  );
}

function LiverModel({
  showLiver = true,
  showTumor = true,
  showVessel = true,
  autoRotate = true,
  liverOpacity = 0.58
}: LiverModelProps) {
  const group = useRef<THREE.Group>(null);
  const portalVein = useMemo(
    () => [
      new THREE.Vector3(-1.12, -0.14, 0.1),
      new THREE.Vector3(-0.48, 0.02, 0.2),
      new THREE.Vector3(0.08, 0.18, 0.05),
      new THREE.Vector3(0.7, 0.2, -0.18),
      new THREE.Vector3(1.25, 0.1, -0.2)
    ],
    []
  );
  const hepaticVein = useMemo(
    () => [
      new THREE.Vector3(-0.52, 0.54, -0.12),
      new THREE.Vector3(-0.1, 0.26, -0.02),
      new THREE.Vector3(0.26, 0.02, 0.04),
      new THREE.Vector3(0.62, -0.22, 0.18),
      new THREE.Vector3(1.06, -0.44, 0.32)
    ],
    []
  );
  const branchVein = useMemo(
    () => [
      new THREE.Vector3(-0.08, 0.1, 0.1),
      new THREE.Vector3(-0.32, -0.22, 0.2),
      new THREE.Vector3(-0.72, -0.4, 0.28),
      new THREE.Vector3(-1.04, -0.48, 0.18)
    ],
    []
  );

  useFrame((_, delta) => {
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.18;
      group.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.035;
    }
  });

  return (
    <group ref={group} rotation={[0.08, -0.35, -0.06]} position={[0, 0, 0]}>
      {showLiver ? (
        <group>
          <mesh scale={[1.7, 0.88, 1.0]} position={[-0.36, 0, 0]} rotation={[0.08, -0.1, -0.08]}>
            <sphereGeometry args={[1, 72, 40]} />
            <meshPhysicalMaterial
              color="#b34f68"
              roughness={0.36}
              metalness={0.04}
              transparent
              opacity={liverOpacity}
              transmission={0.18}
              thickness={0.9}
              clearcoat={0.42}
            />
          </mesh>
          <mesh scale={[1.02, 0.62, 0.78]} position={[0.95, -0.04, 0.02]} rotation={[0.02, 0.36, 0.14]}>
            <sphereGeometry args={[1, 64, 32]} />
            <meshPhysicalMaterial
              color="#cc6876"
              roughness={0.32}
              metalness={0.03}
              transparent
              opacity={Math.max(0.2, liverOpacity - 0.08)}
              transmission={0.12}
              thickness={0.8}
              clearcoat={0.32}
            />
          </mesh>
        </group>
      ) : null}

      {showTumor ? (
        <group>
          <mesh position={[0.56, -0.18, 0.54]} scale={[0.19, 0.19, 0.19]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f97316" emissiveIntensity={0.34} roughness={0.2} />
          </mesh>
          <mesh position={[0.2, 0.18, 0.62]} scale={[0.12, 0.12, 0.12]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.25} roughness={0.24} />
          </mesh>
          <mesh position={[-0.68, -0.24, 0.48]} scale={[0.1, 0.1, 0.1]}>
            <sphereGeometry args={[1, 24, 18]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.22} roughness={0.25} />
          </mesh>
        </group>
      ) : null}

      {showVessel ? (
        <group>
          <Vessel points={portalVein} color="#38bdf8" radius={0.028} />
          <Vessel points={hepaticVein} color="#7dd3fc" radius={0.023} />
          <Vessel points={branchVein} color="#e879f9" radius={0.02} />
        </group>
      ) : null}
    </group>
  );
}

export default function MedicalScene({
  showLiver = true,
  showTumor = true,
  showVessel = true,
  autoRotate = true,
  compact = false,
  liverOpacity = 0.58
}: MedicalSceneProps) {
  return (
    <Canvas
      className="medical-canvas"
      camera={{ position: compact ? [0, 0.1, 4.5] : [0, 0.2, 4.0], fov: compact ? 38 : 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[2.8, 3.5, 4]} intensity={1.8} />
      <pointLight position={[-2, -1, 2]} color="#38bdf8" intensity={3.2} />
      <spotLight position={[0, 3, 2]} angle={0.38} penumbra={0.65} intensity={1.3} color="#ffffff" />
      <LiverModel
        showLiver={showLiver}
        showTumor={showTumor}
        showVessel={showVessel}
        autoRotate={autoRotate}
        liverOpacity={liverOpacity}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        enablePan
        enableZoom
        minDistance={2.6}
        maxDistance={6.5}
        autoRotate={false}
      />
    </Canvas>
  );
}
