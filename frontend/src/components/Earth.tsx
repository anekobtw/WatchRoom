import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function Earth() {
  const ref = useRef<THREE.Mesh | null>(null);

  const texture = useTexture(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg",
  );

  const t = useRef(0);
  const done = useRef(false);

  useFrame(() => {
    if (!ref.current || done.current) return;

    t.current += 0.008;
    const p = Math.min(t.current, 1);
    const eased = 1 - Math.pow(1 - p, 3);

    ref.current.scale.setScalar(0.2 + eased * 1.8);
    ref.current.rotation.y += 0.01 * (1 - eased * 0.7);
    ref.current.rotation.x = eased * 0.6;

    if (p >= 1) done.current = true;
  });

  return (
    <mesh ref={ref} scale={0.2}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function EarthScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Earth />
    </Canvas>
  );
}
