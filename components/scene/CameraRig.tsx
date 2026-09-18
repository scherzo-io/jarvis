"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { useHud } from "@/lib/hud-store";

export function CameraRig() {
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(0, 0.28, 0), []);
  const autoYaw = useRef(0);
  const scene = useHud((state) => state.scene);

  useEffect(() => {
    autoYaw.current = 0;
  }, [scene]);

  useFrame((state, delta) => {
    const { camera: rig } = useHud.getState();
    const { camera } = state;
    if (rig.autoOrbit) {
      autoYaw.current += delta * 0.18;
    }

    const yaw = rig.yaw + autoYaw.current;
    const cosPitch = Math.cos(rig.pitch);
    target.set(
      Math.sin(yaw) * cosPitch * rig.distance,
      Math.sin(rig.pitch) * rig.distance + 0.35,
      Math.cos(yaw) * cosPitch * rig.distance,
    );

    const alpha = 1 - Math.exp(-delta * 3.4);
    camera.position.lerp(target, alpha);
    camera.lookAt(look);

    if (scene === "pulse") {
      const t = state.clock.elapsedTime;
      camera.position.x += Math.sin(t * 11) * 0.012;
      camera.position.y += Math.cos(t * 9) * 0.008;
    }
  });

  return null;
}
