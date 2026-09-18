export const SHELL_REGIONS = [
  "root",
  "topbar",
  "main",
  "stage",
  "rail",
  "feed",
] as const;

export type ShellRegion = (typeof SHELL_REGIONS)[number];

export type ShellRailMode = "default" | "hidden" | "custom";
