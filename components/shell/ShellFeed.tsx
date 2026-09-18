"use client";

import type { ReactNode } from "react";
import { dataModeLabel } from "@/lib/data-mode";
import type { ShellFeedLine } from "./shell-status";
import { useShellReadouts } from "./use-shell-readouts";
import styles from "./shell.module.css";

type FeedEntriesProps = {
  feed: ShellFeedLine[];
};

function FeedEntries({ feed }: FeedEntriesProps): ReactNode {
  if (feed.length === 0) {
    return <p className={styles.empty}>No events</p>;
  }

  return (
    <ol className={styles.feedList}>
      {feed.map((entry) => (
        <li key={entry.id} className={styles.event}>
          <time dateTime={entry.time}>{entry.time}</time>
          <span>{entry.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function ShellFeed(): ReactNode {
  const { feed, dataMode, uplinkFaultMessage } = useShellReadouts();

  return (
    <div className={styles.slot} data-shell-slot="default" data-data-mode={dataMode}>
      <span className={styles.eyebrow}>
        Event feed · {dataModeLabel(dataMode)}
      </span>
      {uplinkFaultMessage ? (
        <p className={styles.fault} data-tone="down">
          {uplinkFaultMessage}
        </p>
      ) : null}
      <FeedEntries feed={feed} />
    </div>
  );
}
