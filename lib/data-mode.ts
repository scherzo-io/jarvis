import type { AgentsHealthStatus } from "./types";

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export const DATA_MODES = ["demo", "live"] as const;
export type DataMode = (typeof DATA_MODES)[number];

export const DATA_MODE_STORAGE_KEY = "jarvis:data-mode";

export type UplinkFault = "missing" | "down";

export type DataModeStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function parseDataMode(value: unknown): DataMode | null {
  if (value === "demo" || value === "live") return value;
  return null;
}

export function dataModeLabel(mode: DataMode): string {
  switch (mode) {
    case "demo":
      return "Demo";
    case "live":
      return "Live";
    default:
      return assertNever(mode);
  }
}

export function resolveDefaultDataMode(input: {
  agentsUrl: string | null | undefined;
  agentsStatus: AgentsHealthStatus;
}): DataMode {
  const url = input.agentsUrl?.trim() ?? "";
  if (!url) return "demo";
  if (input.agentsStatus === "ok") return "live";
  return "demo";
}

export function liveUplinkFault(input: {
  mode: DataMode;
  agentsUrl: string | null | undefined;
  agentsStatus: AgentsHealthStatus;
}): UplinkFault | null {
  if (input.mode !== "live") return null;
  if (!input.agentsUrl?.trim()) return "missing";
  switch (input.agentsStatus) {
    case "ok":
    case "checking":
      return null;
    case "down":
    case "unset":
      return "down";
    default:
      return assertNever(input.agentsStatus);
  }
}

export function liveUplinkFaultMessage(fault: UplinkFault): string {
  switch (fault) {
    case "missing":
      return "Live selected · NEXT_PUBLIC_AGENTS_URL not set";
    case "down":
      return "Live selected · agents uplink down";
    default:
      return assertNever(fault);
  }
}

type FaultTarget = {
  agentsLabel: string;
  agentsTone: AgentsHealthStatus;
  agentsDetail: string;
  uplinkFault: UplinkFault | null;
  uplinkFaultMessage: string | null;
};

export function withLiveFault<T extends FaultTarget>(
  readouts: T,
  fault: UplinkFault | null,
): T {
  if (!fault) return readouts;
  const uplinkFaultMessage = liveUplinkFaultMessage(fault);
  return {
    ...readouts,
    agentsLabel: "FAULT",
    agentsTone: "down",
    agentsDetail: uplinkFaultMessage,
    uplinkFault: fault,
    uplinkFaultMessage,
  };
}

export function readStoredDataMode(
  storage?: DataModeStorage | null,
): DataMode | null {
  if (!storage) return null;
  try {
    return parseDataMode(storage.getItem(DATA_MODE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistDataMode(
  storage: DataModeStorage | null | undefined,
  mode: DataMode,
): void {
  if (!storage) return;
  try {
    storage.setItem(DATA_MODE_STORAGE_KEY, mode);
  } catch {
    // sessionStorage can throw in privacy modes; ignore
  }
}

export function sessionDataModeStorage(): DataModeStorage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}
