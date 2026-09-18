"use client";

import { useEffect } from "react";
import { startAgentsHealthLoop } from "@/lib/agents-health";
import { commandForKeyboard, isHoldable } from "@/lib/commands";
import { restoreStreamDeck } from "@/lib/stream-deck";
import { useHud } from "@/lib/hud-store";

export function InputBridge() {
  useEffect(() => {
    void restoreStreamDeck();
    const stopHealth = startAgentsHealthLoop();
    const holds = new Map<string, number>();

    const onDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const command = commandForKeyboard(event.code);
      if (!command) return;
      event.preventDefault();
      useHud.getState().dispatch(command, "KEY");
      if (isHoldable(command) && command.type === "camera") {
        const move = command.move;
        const timer = window.setInterval(() => {
          useHud.getState().nudgeCamera(move, 1);
        }, 32);
        holds.set(event.code, timer);
      }
    };

    const onUp = (event: KeyboardEvent) => {
      const timer = holds.get(event.code);
      if (timer === undefined) return;
      window.clearInterval(timer);
      holds.delete(event.code);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      stopHealth();
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      for (const timer of holds.values()) window.clearInterval(timer);
    };
  }, []);

  return null;
}
