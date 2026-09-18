"use client";

import { World } from "@/components/scene/World";
import { BootGate } from "./BootGate";
import { InputBridge } from "./InputBridge";
import { Overlay } from "./Overlay";

export default function JarvisHud() {
  return (
    <main className="hud-root">
      <World />
      <Overlay />
      <BootGate />
      <InputBridge />
    </main>
  );
}
