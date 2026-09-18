"use client";

import type { ReactNode } from "react";
import { useShellReadouts } from "./use-shell-readouts";
import styles from "./shell.module.css";

export function ShellRail(): ReactNode {
  const readouts = useShellReadouts();

  return (
    <div className={styles.slot} data-shell-slot="default" data-data-mode={readouts.dataMode}>
      <span className={styles.eyebrow}>Rail slot</span>
      <strong className={styles.value}>{readouts.sceneCallsign}</strong>
      <span className={styles.pill} data-tone={readouts.agentsTone}>
        {readouts.agentsLabel}
      </span>
      <p className={styles.detail}>{readouts.agentsDetail}</p>

      {readouts.metrics.length > 0 ? (
        <dl className={styles.metrics} data-shell="metrics">
          {readouts.metrics.map((metric) => (
            <div key={metric.id} className={styles.metric}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {readouts.board.length > 0 ? (
        <div className={styles.board} data-shell="board">
          <span className={styles.eyebrow}>Sample board</span>
          <div className={styles.lanes}>
            {readouts.board.map((lane) => (
              <section key={lane.id} className={styles.lane}>
                <header>{lane.title}</header>
                <ul>
                  {lane.items.map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
