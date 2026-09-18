"use client";

import { agentsConfiguredUrl } from "@/lib/agents-health";
import { liveUplinkFault, withLiveFault } from "@/lib/data-mode";
import { useHud } from "@/lib/hud-store";
import { SCENES } from "@/lib/scenes";
import { buildLiveMetrics, resolveShellView } from "@/lib/shell-data";
import { buildShellReadouts, type ShellReadouts } from "./shell-status";
import { useDataModeStore } from "./use-data-mode";

export function useShellReadouts(): ShellReadouts {
  const mode = useDataModeStore((state) => state.mode);
  const scene = useHud((state) => state.scene);
  const agents = useHud((state) => state.agents);
  const lastCommand = useHud((state) => state.lastCommand);
  const log = useHud((state) => state.log);
  const camera = useHud((state) => state.camera);
  const theme = SCENES[scene];

  const live = withLiveFault(
    buildShellReadouts({
      sceneLabel: theme.label,
      sceneCallsign: theme.callsign,
      agents,
      lastCommand,
      log,
      metrics: buildLiveMetrics({
        sceneLabel: theme.label,
        distance: camera.distance,
        yaw: camera.yaw,
        pitch: camera.pitch,
        latencyMs: agents.latencyMs,
      }),
      board: [],
      dataMode: "live",
    }),
    liveUplinkFault({
      mode,
      agentsUrl: agentsConfiguredUrl(),
      agentsStatus: agents.status,
    }),
  );

  return resolveShellView({ mode, live });
}
