"use client";

import type { ReactNode } from "react";
import { assertNever } from "@/lib/types";
import { ShellFeed } from "./ShellFeed";
import { ShellRail } from "./ShellRail";
import { ShellTopbar } from "./ShellTopbar";
import type { ShellRailMode } from "./shell-contract";
import { resolveShellRail } from "./shell-status";
import { useDataModeStore, useHydrateDataMode } from "./use-data-mode";
import styles from "./shell.module.css";

export type JarvisShellProps = {
  children: ReactNode;
  topbar?: ReactNode;
  rail?: ReactNode | false;
  feed?: ReactNode;
};

function railAttr(mode: ShellRailMode): "on" | "off" {
  switch (mode) {
    case "hidden":
      return "off";
    case "custom":
    case "default":
      return "on";
    default:
      return assertNever(mode);
  }
}

function renderRail(mode: ShellRailMode, rail: ReactNode | false): ReactNode {
  switch (mode) {
    case "hidden":
      return null;
    case "custom":
      return (
        <aside className={styles.rail} data-shell="rail">
          {rail}
        </aside>
      );
    case "default":
      return (
        <aside className={styles.rail} data-shell="rail">
          <ShellRail />
        </aside>
      );
    default:
      return assertNever(mode);
  }
}

export function JarvisShell({
  children,
  topbar,
  rail,
  feed,
}: JarvisShellProps): ReactNode {
  useHydrateDataMode();
  const dataMode = useDataModeStore((state) => state.mode);
  const railMode = resolveShellRail(rail);

  return (
    <div
      className={styles.root}
      data-shell="root"
      data-shell-rail={railAttr(railMode)}
      data-shell-data-mode={dataMode}
    >
      <header className={styles.topbar} data-shell="topbar">
        {topbar ?? <ShellTopbar />}
      </header>
      <div className={styles.main} data-shell="main">
        <div className={styles.stage} data-shell="stage">
          {children}
        </div>
        {renderRail(railMode, rail)}
      </div>
      <footer className={styles.feed} data-shell="feed">
        {feed ?? <ShellFeed />}
      </footer>
    </div>
  );
}
