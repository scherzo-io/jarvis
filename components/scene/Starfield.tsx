"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (180.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

function hashed(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uGold;
  uniform vec3 uTeal;
  varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + vSeed * 4.0) + vSeed * 20.0);
    vec3 color = mix(uGold, uTeal, vSeed);
    gl_FragColor = vec4(color, (1.0 - d) * twinkle);
  }
`;

export function Starfield() {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const count = 2800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 8 + hashed(i + 1) * 28;
      const theta = hashed(i + 17) * Math.PI * 2;
      const phi = Math.acos(2 * hashed(i + 41) - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.62;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.04 + hashed(i + 73) * 0.12;
      seeds[i] = hashed(i + 99);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return geo;
  }, []);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    const theme = SCENES[useHud.getState().scene];
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.012 * (0.4 + theme.energy);
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTime: { value: 0 },
          uGold: { value: [0.91, 0.72, 0.43] },
          uTeal: { value: [0.31, 0.89, 0.77] },
        }}
      />
    </points>
  );
}
