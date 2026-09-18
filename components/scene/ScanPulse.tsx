"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, type Mesh, type MeshBasicMaterial } from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";

export function ScanPulse() {
  const ring = useRef<Mesh>(null);

  useFrame((state) => {
    const theme = SCENES[useHud.getState().scene];
    const cycle = (state.clock.elapsedTime * (0.22 + theme.energy * 0.35)) % 1;
    const scale = 0.4 + cycle * 8.5;
    if (ring.current) {
      ring.current.scale.set(scale, scale, scale);
      const material = ring.current.material as MeshBasicMaterial;
      material.opacity = (1 - cycle) * 0.45 * theme.energy;
      material.color.set(theme.secondary);
    }
  });

  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.82, 0]}>
      <ringGeometry args={[0.92, 1, 80]} />
      <meshBasicMaterial color="#4ee4c6" transparent opacity={0.3} side={DoubleSide} />
    </mesh>
  );
}
