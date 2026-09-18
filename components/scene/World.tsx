"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense } from "react";
import { Color, Vector2 } from "three";
import { SCENES } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";
import { CameraRig } from "./CameraRig";
import { CommandCore } from "./CommandCore";
import { OrbitRings } from "./OrbitRings";
import { ReactorGrid } from "./ReactorGrid";
import { ScanPulse } from "./ScanPulse";
import { Starfield } from "./Starfield";

function Atmosphere() {
  const scene = useHud((state) => state.scene);
  const theme = SCENES[scene];

  return (
    <>
      <color attach="background" args={[theme.fog]} />
      <fog attach="fog" args={[theme.fog, 8, 34]} />
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0.2, 0]} intensity={18} distance={12} color={theme.primary} />
      <pointLight position={[4, 3, -2]} intensity={6} distance={16} color={theme.secondary} />
      <spotLight
        position={[0, 10, 4]}
        intensity={8}
        angle={0.5}
        penumbra={0.8}
        color={new Color("#fff4d8")}
      />
      <CameraRig />
      <CommandCore />
      <OrbitRings />
      <ReactorGrid />
      <ScanPulse />
      <Starfield />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={theme.bloom}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0008, 0.0012)}
          radialModulation
          modulationOffset={0.4}
        />
        <Noise opacity={0.08} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

export function World() {
  return (
    <Canvas
      className="hud-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [6, 3.2, 8], fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Atmosphere />
      </Suspense>
    </Canvas>
  );
}
