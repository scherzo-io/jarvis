import { create } from "zustand";
import { describeCommand } from "./commands";
import { SCENES } from "./scenes";
import {
  assertNever,
  type AgentsHealth,
  type CameraMove,
  type CameraState,
  type Command,
  type PanelId,
  type SceneId,
  type StreamDeckInfo,
} from "./types";

const PITCH_MIN = -0.85;
const PITCH_MAX = 1.15;
const DIST_MIN = 3.2;
const DIST_MAX = 22;

export type LogEntry = {
  id: number;
  at: number;
  text: string;
};

type HudState = {
  booted: boolean;
  scene: SceneId;
  camera: CameraState;
  panels: Record<PanelId, boolean>;
  streamDeck: StreamDeckInfo;
  agents: AgentsHealth;
  lastCommand: string;
  log: LogEntry[];
  setBooted: (booted: boolean) => void;
  dispatch: (command: Command, source: string) => void;
  nudgeCamera: (move: CameraMove, intensity: number) => void;
  setStreamDeck: (patch: Partial<StreamDeckInfo>) => void;
  setAgents: (patch: Partial<AgentsHealth>) => void;
};

let logSeq = 0;

function applySceneCamera(scene: SceneId): CameraState {
  const theme = SCENES[scene];
  return {
    yaw: theme.yaw,
    pitch: theme.pitch,
    distance: theme.distance,
    autoOrbit: false,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyMove(camera: CameraState, move: CameraMove, intensity: number): CameraState {
  switch (move) {
    case "yawLeft":
      return { ...camera, yaw: camera.yaw - 0.045 * intensity, autoOrbit: false };
    case "yawRight":
      return { ...camera, yaw: camera.yaw + 0.045 * intensity, autoOrbit: false };
    case "pitchUp":
      return {
        ...camera,
        pitch: clamp(camera.pitch + 0.03 * intensity, PITCH_MIN, PITCH_MAX),
        autoOrbit: false,
      };
    case "pitchDown":
      return {
        ...camera,
        pitch: clamp(camera.pitch - 0.03 * intensity, PITCH_MIN, PITCH_MAX),
        autoOrbit: false,
      };
    case "zoomIn":
      return {
        ...camera,
        distance: clamp(camera.distance - 0.28 * intensity, DIST_MIN, DIST_MAX),
      };
    case "zoomOut":
      return {
        ...camera,
        distance: clamp(camera.distance + 0.28 * intensity, DIST_MIN, DIST_MAX),
      };
    case "reset":
      return applySceneCamera(useHud.getState().scene);
    case "toggleAutoOrbit":
      return { ...camera, autoOrbit: !camera.autoOrbit };
    default:
      return assertNever(move);
  }
}

export const useHud = create<HudState>((set) => ({
  booted: false,
  scene: "orbit",
  camera: applySceneCamera("orbit"),
  panels: {
    systems: true,
    agents: true,
    comms: true,
    telemetry: true,
  },
  streamDeck: {
    connected: false,
    productName: "NONE",
    productId: null,
    keyCount: 0,
    lastKey: null,
    lastLabel: "STANDBY",
  },
  agents: {
    status: "unset",
    latencyMs: null,
    detail: "NEXT_PUBLIC_AGENTS_URL not set",
    checkedAt: null,
    url: null,
  },
  lastCommand: "AWAITING INPUT",
  log: [
    { id: 0, at: Date.now(), text: "JARVIS KERNEL AWAKE" },
    { id: 1, at: Date.now(), text: "HID CHANNEL IDLE" },
  ],
  setBooted: (booted) => set({ booted }),
  dispatch: (command, source) => {
    const label = `${source} · ${describeCommand(command)}`;
    set((state) => {
      const next: Partial<HudState> = {
        lastCommand: label,
        log: [
          { id: ++logSeq, at: Date.now(), text: label },
          ...state.log,
        ].slice(0, 10),
      };

      switch (command.type) {
        case "scene":
          next.scene = command.scene;
          next.camera = {
            ...applySceneCamera(command.scene),
            autoOrbit: state.camera.autoOrbit,
          };
          break;
        case "camera":
          next.camera = applyMove(state.camera, command.move, 1);
          break;
        case "panel":
          next.panels = {
            ...state.panels,
            [command.panel]: !state.panels[command.panel],
          };
          break;
        default:
          return assertNever(command);
      }

      return next;
    });
  },
  nudgeCamera: (move, intensity) => {
    set((state) => ({ camera: applyMove(state.camera, move, intensity) }));
  },
  setStreamDeck: (patch) => {
    set((state) => ({ streamDeck: { ...state.streamDeck, ...patch } }));
  },
  setAgents: (patch) => {
    set((state) => ({ agents: { ...state.agents, ...patch } }));
  },
}));
