export const SCENE_IDS = ["core", "orbit", "tactical", "wide", "pulse"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const PANEL_IDS = ["systems", "agents", "comms", "telemetry"] as const;
export type PanelId = (typeof PANEL_IDS)[number];

export const CAMERA_MOVES = [
  "yawLeft",
  "yawRight",
  "pitchUp",
  "pitchDown",
  "reset",
  "toggleAutoOrbit",
  "zoomIn",
  "zoomOut",
] as const;
export type CameraMove = (typeof CAMERA_MOVES)[number];

export type Command =
  | { type: "scene"; scene: SceneId }
  | { type: "camera"; move: CameraMove }
  | { type: "panel"; panel: PanelId };

export type AgentsHealthStatus = "unset" | "checking" | "ok" | "down";

export type AgentsHealth = {
  status: AgentsHealthStatus;
  latencyMs: number | null;
  detail: string;
  checkedAt: number | null;
  url: string | null;
};

export type StreamDeckInfo = {
  connected: boolean;
  productName: string;
  productId: number | null;
  keyCount: number;
  lastKey: number | null;
  lastLabel: string;
};

export type CameraState = {
  yaw: number;
  pitch: number;
  distance: number;
  autoOrbit: boolean;
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
