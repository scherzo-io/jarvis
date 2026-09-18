"use client";

import type { ReactNode } from "react";
import { agentsConfiguredUrl } from "@/lib/agents-health";
import {
  dataModeLabel,
  liveUplinkFault,
  liveUplinkFaultMessage,
  type DataMode,
} from "@/lib/data-mode";
import { useHud } from "@/lib/hud-store";
import { useDataModeStore } from "./use-data-mode";
import styles from "./shell.module.css";

const OPTIONS: DataMode[] = ["demo", "live"];

export function DataModeToggle(): ReactNode {
  const mode = useDataModeStore((state) => state.mode);
  const setMode = useDataModeStore((state) => state.setMode);
  const agentsStatus = useHud((state) => state.agents.status);
  const fault = liveUplinkFault({
    mode,
    agentsUrl: agentsConfiguredUrl(),
    agentsStatus,
  });

  return (
    <div className={styles.modeBlock} data-shell="data-mode">
      <span className={styles.label}>Data</span>
      <div className={styles.modeSwitch} role="group" aria-label="Data source">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.modeButton}
            aria-pressed={mode === option}
            data-mode={option}
            onClick={() => setMode(option)}
          >
            {dataModeLabel(option)}
          </button>
        ))}
      </div>
      {fault ? (
        <span className={styles.fault} data-tone="down">
          {liveUplinkFaultMessage(fault)}
        </span>
      ) : null}
    </div>
  );
}
