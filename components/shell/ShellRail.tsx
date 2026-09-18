"use client";

import type { ReactNode } from "react";
import { useShellReadouts } from "./use-shell-readouts";
import styles from "./shell.module.css";

export function ShellRail(): ReactNode {
  const readouts = useShellReadouts();

  return (
    <div className={styles.slot} data-shell-slot="default">
      <span className={styles.eyebrow}>Rail slot</span>
      <strong className={styles.value}>{readouts.sceneCallsign}</strong>
      <span className={styles.pill} data-tone={readouts.agentsTone}>
        {readouts.agentsLabel}
      </span>
      <p className={styles.detail}>{readouts.agentsDetail}</p>
    </div>
  );
}
