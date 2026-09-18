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
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={[theme.fog, 9, 36]} />
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 0.2, 0]} intensity={18} distance={12} color={theme.primary} />
      <pointLight position={[4, 3, -2]} intensity={5.4} distance={16} color={theme.secondary} />
      <pointLight position={[-5, 2.4, 3]} intensity={3.2} distance={14} color="#37e5ff" />
      <spotLight
        position={[0, 10, 4]}
        intensity={7.2}
        angle={0.48}
        penumbra={0.82}
        color={new Color("#d8f4ff")}
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
          luminanceThreshold={0.16}
          luminanceSmoothing={0.36}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0008, 0.0012)}
          radialModulation
          modulationOffset={0.4}
        />
        <Noise opacity={0.08} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.16} darkness={0.9} />
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
      fallback={<p className="hud-webgl-fallback">HOLOGRAM DRIVER UNAVAILABLE</p>}
    >
      <Suspense fallback={null}>
        <Atmosphere />
      </Suspense>
    </Canvas>
  );
}
