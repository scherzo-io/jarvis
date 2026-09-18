"use client";

import { useEffect } from "react";
import { useHud } from "@/lib/hud-store";

export function BootGate() {
  const booted = useHud((state) => state.booted);
  const setBooted = useHud((state) => state.setBooted);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 2200);
    return () => window.clearTimeout(timer);
  }, [setBooted]);

  return (
    <div className={`hud-boot ${booted ? "is-gone" : ""}`} aria-hidden={booted}>
      <div className="hud-boot-frame hud-frame">
        <p>INITIALIZING SCHERZO KERNEL</p>
        <strong>J.A.R.V.I.S</strong>
        <span>HOLOGRAPHIC COMMAND DECK ONLINE</span>
        <i className="hud-boot-ticks" aria-hidden />
      </div>
    </div>
  );
}
