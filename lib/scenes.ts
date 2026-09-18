import type { SceneId } from "./types";

export type SceneTheme = {
  id: SceneId;
  label: string;
  callsign: string;
  yaw: number;
  pitch: number;
  distance: number;
  coreSpeed: number;
  ringSpeed: number;
  bloom: number;
  fog: string;
  primary: string;
  secondary: string;
  energy: number;
};

export const SCENES: Record<SceneId, SceneTheme> = {
  core: {
    id: "core",
    label: "CORE LOCK",
    callsign: "INTIMATE",
    yaw: 0.42,
    pitch: 0.16,
    distance: 5.4,
    coreSpeed: 0.35,
    ringSpeed: 0.12,
    bloom: 1.55,
    fog: "#07040a",
    primary: "#e8b86d",
    secondary: "#4ee4c6",
    energy: 0.72,
  },
  orbit: {
    id: "orbit",
    label: "ORBITAL",
    callsign: "STANDARD",
    yaw: 0.95,
    pitch: 0.38,
    distance: 9.2,
    coreSpeed: 0.22,
    ringSpeed: 0.2,
    bloom: 1.2,
    fog: "#04060c",
    primary: "#d7a35a",
    secondary: "#6fe0d2",
    energy: 0.5,
  },
  tactical: {
    id: "tactical",
    label: "TACTICAL",
    callsign: "LOW ANGLE",
    yaw: -0.55,
    pitch: -0.08,
    distance: 7.1,
    coreSpeed: 0.48,
    ringSpeed: 0.36,
    bloom: 1.35,
    fog: "#05080c",
    primary: "#4ee4c6",
    secondary: "#e8b86d",
    energy: 0.86,
  },
  wide: {
    id: "wide",
    label: "COMMAND",
    callsign: "WIDE",
    yaw: 1.35,
    pitch: 0.62,
    distance: 14.5,
    coreSpeed: 0.12,
    ringSpeed: 0.08,
    bloom: 0.95,
    fog: "#030208",
    primary: "#c9a36a",
    secondary: "#89a0c8",
    energy: 0.34,
  },
  pulse: {
    id: "pulse",
    label: "PULSE",
    callsign: "OVERDRIVE",
    yaw: 0.18,
    pitch: 0.22,
    distance: 4.6,
    coreSpeed: 0.85,
    ringSpeed: 0.55,
    bloom: 2.1,
    fog: "#10060a",
    primary: "#ffc56a",
    secondary: "#ff5a7a",
    energy: 1,
  },
};

export const SCENE_LIST = Object.values(SCENES);
