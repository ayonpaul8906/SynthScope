import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function DistortedSphere() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.12;
      ref.current.rotation.y += delta * 0.18;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.0}>
      <Sphere ref={ref} args={[1.2, 100, 100]} scale={1}>
        <MeshDistortMaterial
          color="#e0c088"
          attach="material"
          distort={0.4}
          speed={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
    </Float>
  );
}

export function AISphere() {
  return (
    <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.8} color="#e0c088" />
        <pointLight position={[-5, -3, -3]} intensity={1.2} color="#38bdf8" />
        <DistortedSphere />
        <Stars radius={40} depth={20} count={600} factor={1.5} fade speed={0.4} />
      </Suspense>
    </Canvas>
  );
}
