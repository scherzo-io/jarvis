"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";

export function CommandCore() {
  const group = useRef<Group>(null);
  const inner = useRef<Mesh>(null);
  const glass = useRef<Mesh>(null);
  const spike = useRef<Mesh>(null);
  const gold = useMemo(() => new Color("#e8b86d"), []);
  const teal = useMemo(() => new Color("#4ee4c6"), []);
  const rose = useMemo(() => new Color("#ff5a7a"), []);
  const mix = useMemo(() => new Color(), []);

  useFrame((state, delta) => {
    const theme = SCENES[useHud.getState().scene];
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * (1.8 + theme.energy * 3)) * 0.035 * theme.energy;

    if (group.current) {
      group.current.rotation.y += delta * theme.coreSpeed;
      group.current.rotation.x = Math.sin(t * 0.17) * 0.12;
      group.current.scale.setScalar(pulse);
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * theme.coreSpeed * 1.8;
      inner.current.rotation.z += delta * 0.22;
    }
    if (glass.current) {
      glass.current.rotation.x += delta * 0.18;
      glass.current.rotation.y -= delta * 0.12;
    }
    if (spike.current) {
      spike.current.rotation.z -= delta * theme.coreSpeed * 0.7;
    }

    mix.copy(gold).lerp(theme.id === "tactical" ? teal : theme.id === "pulse" ? rose : gold, 0.55);
    const mats = [inner.current, glass.current, spike.current];
    for (const mesh of mats) {
      const material = mesh?.material;
      if (material && !Array.isArray(material) && "emissive" in material) {
        (material as MeshStandardMaterial).emissive.lerp(mix, 0.08);
      }
    }
  });

  return (
    <group ref={group}>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color="#1a1208"
          emissive="#e8b86d"
          emissiveIntensity={1.8}
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>
      <mesh ref={glass} scale={1.22}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshPhysicalMaterial
          color="#e8b86d"
          metalness={0.15}
          roughness={0.05}
          transmission={0.72}
          thickness={1.1}
          transparent
          opacity={0.55}
          emissive="#4a2e10"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh ref={spike} scale={1.48}>
        <octahedronGeometry args={[1.05, 0]} />
        <meshBasicMaterial color="#e8b86d" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh scale={1.86} rotation={[Math.PI / 3, 0.4, 0.2]}>
        <dodecahedronGeometry args={[1.05, 0]} />
        <meshBasicMaterial color="#37e5ff" wireframe transparent opacity={0.28} />
      </mesh>
    </group>
  );
}
