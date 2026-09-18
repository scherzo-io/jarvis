"use client";

import { useHud } from "@/lib/hud-store";
import { SCENES } from "@/lib/scenes";
import { buildShellReadouts, type ShellReadouts } from "./shell-status";

export function useShellReadouts(): ShellReadouts {
  const scene = useHud((state) => state.scene);
  const agents = useHud((state) => state.agents);
  const lastCommand = useHud((state) => state.lastCommand);
  const log = useHud((state) => state.log);
  const theme = SCENES[scene];

  return buildShellReadouts({
    sceneLabel: theme.label,
    sceneCallsign: theme.callsign,
    agents,
    lastCommand,
    log,
  });
}
