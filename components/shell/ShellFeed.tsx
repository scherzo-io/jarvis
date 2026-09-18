"use client";

import type { ReactNode } from "react";
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
  const { feed } = useShellReadouts();

  return (
    <div className={styles.slot} data-shell-slot="default">
      <span className={styles.eyebrow}>Event feed</span>
      <FeedEntries feed={feed} />
    </div>
  );
}
