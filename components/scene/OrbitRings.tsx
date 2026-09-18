"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Group } from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";

function Ring({
  radius,
  tilt,
  color,
  speed,
  dash,
}: {
  radius: number;
  tilt: [number, number, number];
  color: string;
  speed: number;
  dash: number;
}) {
  const ref = useRef<Group>(null);
  const ticks = useMemo(() => {
    return Array.from({ length: 48 }, (_, index) => {
      const angle = (index / 48) * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        rotation: -angle,
        major: index % 6 === 0,
      };
    });
  }, [radius]);

  useFrame((_, delta) => {
    const theme = SCENES[useHud.getState().scene];
    if (ref.current) {
      ref.current.rotation.z += delta * speed * theme.ringSpeed * 2.4;
    }
  });

  return (
    <group ref={ref} rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} side={DoubleSide} />
      </mesh>
      {ticks.map((tick, index) => (
        <mesh
          key={`${radius}-${index}`}
          position={[tick.x, 0, tick.z]}
          rotation={[0, tick.rotation, 0]}
        >
          <boxGeometry args={[tick.major ? 0.09 : 0.045, 0.006, tick.major ? 0.018 : 0.01]} />
          <meshBasicMaterial color={color} transparent opacity={tick.major ? 0.9 : dash} />
        </mesh>
      ))}
    </group>
  );
}

function Satellite({
  radius,
  speed,
  phase,
  color,
}: {
  radius: number;
  speed: number;
  phase: number;
  color: string;
}) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    const theme = SCENES[useHud.getState().scene];
    const t = state.clock.elapsedTime * speed * (0.35 + theme.ringSpeed);
    const x = Math.cos(t + phase) * radius;
    const z = Math.sin(t + phase) * radius;
    if (ref.current) {
      ref.current.position.set(x, Math.sin(t * 1.7) * 0.15, z);
      ref.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export function OrbitRings() {
  return (
    <group>
      <Ring radius={2.35} tilt={[0.2, 0.1, 0]} color="#e8b86d" speed={0.35} dash={0.35} />
      <Ring radius={3.15} tilt={[1.15, 0.4, 0.2]} color="#4ee4c6" speed={-0.22} dash={0.28} />
      <Ring radius={4.05} tilt={[-0.55, 0.8, 0.15]} color="#c9a36a" speed={0.14} dash={0.2} />
      <Ring radius={5.1} tilt={[0.05, -0.2, 0.7]} color="#89a0c8" speed={-0.1} dash={0.16} />
      <Satellite radius={2.35} speed={0.9} phase={0.2} color="#e8b86d" />
      <Satellite radius={3.15} speed={-0.7} phase={1.4} color="#4ee4c6" />
      <Satellite radius={4.05} speed={0.45} phase={2.8} color="#ffc56a" />
    </group>
  );
}
