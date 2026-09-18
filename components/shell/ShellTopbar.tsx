"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DataModeToggle } from "./DataModeToggle";
import { formatClock } from "./shell-status";
import { useShellReadouts } from "./use-shell-readouts";
import styles from "./shell.module.css";

function useUtcClock(): string {
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    function tick(): void {
      setClock(formatClock(new Date()));
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}

export function ShellTopbar(): ReactNode {
  const readouts = useShellReadouts();
  const clock = useUtcClock();

  return (
    <div className={`${styles.slot} ${styles.topbarSlot}`} data-shell-slot="default">
      <section className={styles.brand}>
        <span className={styles.eyebrow}>SCHERZO COMMAND</span>
        <strong className={styles.brandName}>{readouts.brand}</strong>
        <time className={styles.clock} dateTime={clock}>
          {clock} UTC
        </time>
      </section>
      <div className={styles.readouts}>
        <DataModeToggle />
        <div className={styles.readout}>
          <span className={styles.label}>Scene</span>
          <strong className={styles.value}>{readouts.sceneLabel}</strong>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>Agents</span>
          <span className={styles.pill} data-tone={readouts.agentsTone}>
            {readouts.agentsLabel}
          </span>
        </div>
      </div>
      <div className={styles.readout}>
        <span className={styles.label}>Last directive</span>
        <strong className={styles.command}>{readouts.lastCommand}</strong>
      </div>
    </div>
  );
}
