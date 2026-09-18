"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { agentsConfiguredUrl } from "@/lib/agents-health";
import {
  persistDataMode,
  readStoredDataMode,
  resolveDefaultDataMode,
  sessionDataModeStorage,
  type DataMode,
} from "@/lib/data-mode";
import { useHud } from "@/lib/hud-store";
import type { AgentsHealthStatus } from "@/lib/types";

type DataModeState = {
  mode: DataMode;
  hydrated: boolean;
  hydrate: (input: {
    agentsUrl: string | null;
    agentsStatus: AgentsHealthStatus;
  }) => void;
  setMode: (mode: DataMode) => void;
};

export const useDataModeStore = create<DataModeState>((set, get) => ({
  mode: "demo",
  hydrated: false,
  hydrate(input) {
    if (get().hydrated) return;
    const storage = sessionDataModeStorage();
    const stored = readStoredDataMode(storage);
    const mode = stored ?? resolveDefaultDataMode(input);
    if (!stored) persistDataMode(storage, mode);
    set({ mode, hydrated: true });
  },
  setMode(mode) {
    persistDataMode(sessionDataModeStorage(), mode);
    set({ mode });
  },
}));

export function useHydrateDataMode(): void {
  useEffect(() => {
    useDataModeStore.getState().hydrate({
      agentsUrl: agentsConfiguredUrl(),
      agentsStatus: useHud.getState().agents.status,
    });
  }, []);
}
