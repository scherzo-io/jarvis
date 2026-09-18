import type { DataMode, UplinkFault } from "@/lib/data-mode";
import type { LogEntry } from "@/lib/hud-store";
import type { AgentsHealth, AgentsHealthStatus } from "@/lib/types";
import type { ShellRailMode } from "./shell-contract";

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export type ShellFeedLine = {
  id: number;
  time: string;
  text: string;
};

export type ShellMetric = {
  id: string;
  label: string;
  value: string;
};

export type ShellBoardItem = {
  id: string;
  text: string;
};

export type ShellBoardLane = {
  id: string;
  title: string;
  items: ShellBoardItem[];
};

export type ShellReadouts = {
  brand: string;
  sceneLabel: string;
  sceneCallsign: string;
  agentsLabel: string;
  agentsTone: AgentsHealthStatus;
  agentsDetail: string;
  lastCommand: string;
  feed: ShellFeedLine[];
  metrics: ShellMetric[];
  board: ShellBoardLane[];
  dataMode: DataMode;
  uplinkFault: UplinkFault | null;
  uplinkFaultMessage: string | null;
};

export type ShellReadoutSource = {
  sceneLabel: string;
  sceneCallsign: string;
  agents: AgentsHealth;
  lastCommand: string;
  log: LogEntry[];
  metrics?: ShellMetric[];
  board?: ShellBoardLane[];
  dataMode?: DataMode;
};

export function agentsStatusLabel(status: AgentsHealthStatus): string {
  switch (status) {
    case "ok":
      return "ONLINE";
    case "down":
      return "FAULT";
    case "checking":
      return "PING";
    case "unset":
      return "UNLINKED";
    default:
      return assertNever(status);
  }
}

export function formatClock(date: Date): string {
  return date.toISOString().slice(11, 19);
}

export function formatFeedLines(
  log: LogEntry[],
  limit = 8,
): ShellFeedLine[] {
  return log.slice(0, limit).map((entry) => ({
    id: entry.id,
    time: formatClock(new Date(entry.at)),
    text: entry.text,
  }));
}

export function buildShellReadouts(input: ShellReadoutSource): ShellReadouts {
  return {
    brand: "J.A.R.V.I.S",
    sceneLabel: input.sceneLabel,
    sceneCallsign: input.sceneCallsign,
    agentsLabel: agentsStatusLabel(input.agents.status),
    agentsTone: input.agents.status,
    agentsDetail: input.agents.detail,
    lastCommand: input.lastCommand,
    feed: formatFeedLines(input.log),
    metrics: input.metrics ?? [],
    board: input.board ?? [],
    dataMode: input.dataMode ?? "live",
    uplinkFault: null,
    uplinkFaultMessage: null,
  };
}

export function resolveShellRail(rail: unknown): ShellRailMode {
  if (rail === false) return "hidden";
  if (rail === undefined) return "default";
  return "custom";
}
