"use client";

import { useHud } from "@/lib/hud-store";
import { SCENES } from "@/lib/scenes";
import { buildShellReadouts, type ShellReadouts } from "./shell-status";

export function useShellReadouts(): ShellReadouts {
  return useHud((state) => {
    const theme = SCENES[state.scene];
    return buildShellReadouts({
      sceneLabel: theme.label,
      sceneCallsign: theme.callsign,
      agents: state.agents,
      lastCommand: state.lastCommand,
      log: state.log,
    });
  });
}
