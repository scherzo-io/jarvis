import { SCENES } from "./scenes";
import {
  assertNever,
  type CameraMove,
  type Command,
  type PanelId,
  type SceneId,
} from "./types";

export const STREAM_DECK_MAP: Record<number, Command> = {
  0: { type: "scene", scene: "core" },
  1: { type: "scene", scene: "orbit" },
  2: { type: "scene", scene: "tactical" },
  3: { type: "scene", scene: "wide" },
  4: { type: "scene", scene: "pulse" },
  5: { type: "camera", move: "yawLeft" },
  6: { type: "camera", move: "pitchUp" },
  7: { type: "camera", move: "reset" },
  8: { type: "camera", move: "pitchDown" },
  9: { type: "camera", move: "yawRight" },
  10: { type: "panel", panel: "systems" },
  11: { type: "panel", panel: "agents" },
  12: { type: "panel", panel: "comms" },
  13: { type: "panel", panel: "telemetry" },
  14: { type: "camera", move: "toggleAutoOrbit" },
  15: { type: "camera", move: "zoomIn" },
  16: { type: "camera", move: "zoomOut" },
};

export const HOLDABLE_MOVES = new Set<CameraMove>([
  "yawLeft",
  "yawRight",
  "pitchUp",
  "pitchDown",
  "zoomIn",
  "zoomOut",
]);

export const KEYBOARD_MAP: Record<string, Command> = {
  Digit1: { type: "scene", scene: "core" },
  Digit2: { type: "scene", scene: "orbit" },
  Digit3: { type: "scene", scene: "tactical" },
  Digit4: { type: "scene", scene: "wide" },
  Digit5: { type: "scene", scene: "pulse" },
  ArrowLeft: { type: "camera", move: "yawLeft" },
  ArrowRight: { type: "camera", move: "yawRight" },
  ArrowUp: { type: "camera", move: "pitchUp" },
  ArrowDown: { type: "camera", move: "pitchDown" },
  KeyR: { type: "camera", move: "reset" },
  Space: { type: "camera", move: "toggleAutoOrbit" },
  Equal: { type: "camera", move: "zoomIn" },
  Minus: { type: "camera", move: "zoomOut" },
  KeyQ: { type: "panel", panel: "systems" },
  KeyA: { type: "panel", panel: "agents" },
  KeyC: { type: "panel", panel: "comms" },
  KeyT: { type: "panel", panel: "telemetry" },
};

export function commandForStreamDeckKey(index: number): Command | null {
  return STREAM_DECK_MAP[index] ?? null;
}

export function commandForKeyboard(code: string): Command | null {
  return KEYBOARD_MAP[code] ?? null;
}

export function isHoldable(command: Command): boolean {
  return command.type === "camera" && HOLDABLE_MOVES.has(command.move);
}

export function describeCommand(command: Command): string {
  switch (command.type) {
    case "scene":
      return `SCENE ${SCENES[command.scene].label}`;
    case "camera":
      return describeCameraMove(command.move);
    case "panel":
      return `PANEL ${panelLabel(command.panel)}`;
    default:
      return assertNever(command);
  }
}

export function describeCameraMove(move: CameraMove): string {
  switch (move) {
    case "yawLeft":
      return "CAM YAW −";
    case "yawRight":
      return "CAM YAW +";
    case "pitchUp":
      return "CAM PITCH +";
    case "pitchDown":
      return "CAM PITCH −";
    case "reset":
      return "CAM RESET";
    case "toggleAutoOrbit":
      return "AUTO ORBIT";
    case "zoomIn":
      return "CAM ZOOM IN";
    case "zoomOut":
      return "CAM ZOOM OUT";
    default:
      return assertNever(move);
  }
}

export function panelLabel(panel: PanelId): string {
  switch (panel) {
    case "systems":
      return "SYSTEMS";
    case "agents":
      return "AGENTS";
    case "comms":
      return "COMMS";
    case "telemetry":
      return "TELEMETRY";
    default:
      return assertNever(panel);
  }
}

export function sceneLabel(scene: SceneId): string {
  return SCENES[scene].label;
}
