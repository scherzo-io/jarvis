"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, DoubleSide, type ShaderMaterial } from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";

const vertex = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3 uColor;
  float grid(vec2 p, float scale) {
    vec2 w = fwidth(p * scale);
    vec2 g = abs(fract(p * scale - 0.5) - 0.5) / max(w, vec2(1e-4));
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float g1 = grid(vPos.xz, 0.55);
    float g2 = grid(vPos.xz, 0.08);
    float fade = 1.0 - smoothstep(4.0, 28.0, length(vPos.xz));
    float sweep = 0.35 + 0.65 * sin(vPos.x * 0.18 + uTime * 0.7);
    float alpha = (g1 * 0.55 + g2 * 0.18) * fade * sweep;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function ReactorGrid() {
  const material = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    const theme = SCENES[useHud.getState().scene];
    (material.current.uniforms.uColor.value as Color).set(theme.primary);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
      <planeGeometry args={[70, 70, 1, 1]} />
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        side={DoubleSide}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new Color("#e8b86d") },
        }}
      />
    </mesh>
  );
}
