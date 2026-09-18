import type { DataMode } from "./data-mode";
import type {
  ShellBoardLane,
  ShellFeedLine,
  ShellMetric,
  ShellReadouts,
} from "../components/shell/shell-status";

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

const DEMO_FEED: ShellFeedLine[] = [
  { id: 9001, time: "08:10:16", text: "DEMO · SAMPLE FEED ONLINE" },
  { id: 9002, time: "08:10:08", text: "DEMO · FIXTURE METRICS LOADED" },
  { id: 9003, time: "08:10:00", text: "DEMO · SAMPLE BOARD READY" },
];

const DEMO_METRICS: ShellMetric[] = [
  { id: "reactor", label: "REACTOR", value: "74%" },
  { id: "range", label: "RANGE", value: "8.4m" },
  { id: "yaw", label: "YAW", value: "0.42" },
  { id: "lat", label: "LAT", value: "4ms" },
];

const DEMO_BOARD: ShellBoardLane[] = [
  {
    id: "intake",
    title: "INTAKE",
    items: [
      { id: "i1", text: "Sample ticket A" },
      { id: "i2", text: "Sample ticket B" },
    ],
  },
  {
    id: "active",
    title: "ACTIVE",
    items: [{ id: "a1", text: "Sample run" }],
  },
  {
    id: "hold",
    title: "HOLD",
    items: [{ id: "h1", text: "Fixture wait" }],
  },
];

export function buildDemoReadouts(): ShellReadouts {
  return {
    brand: "J.A.R.V.I.S",
    sceneLabel: "SAMPLE ORBIT",
    sceneCallsign: "FIXTURE",
    agentsLabel: "ONLINE",
    agentsTone: "ok",
    agentsDetail: "Local sample uplink",
    lastCommand: "DEMO · SAMPLE DIRECTIVE",
    feed: DEMO_FEED,
    metrics: DEMO_METRICS,
    board: DEMO_BOARD,
    dataMode: "demo",
    uplinkFault: null,
    uplinkFaultMessage: null,
  };
}

export function buildLiveMetrics(input: {
  sceneLabel: string;
  distance: number;
  yaw: number;
  pitch: number;
  latencyMs: number | null;
}): ShellMetric[] {
  return [
    { id: "scene", label: "SCENE", value: input.sceneLabel },
    { id: "range", label: "RANGE", value: `${input.distance.toFixed(1)}m` },
    { id: "yaw", label: "YAW", value: input.yaw.toFixed(2) },
    { id: "pitch", label: "PITCH", value: input.pitch.toFixed(2) },
    {
      id: "lat",
      label: "LAT",
      value: input.latencyMs == null ? "—" : `${input.latencyMs}ms`,
    },
  ];
}

export function resolveShellView(input: {
  mode: DataMode;
  live: ShellReadouts;
}): ShellReadouts {
  switch (input.mode) {
    case "demo":
      return buildDemoReadouts();
    case "live":
      return input.live;
    default:
      return assertNever(input.mode);
  }
}
