"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { panelLabel } from "@/lib/commands";
import { connectStreamDeck, isHidSupported } from "@/lib/stream-deck";
import { SCENES, SCENE_LIST } from "@/lib/scenes";
import { useHud } from "@/lib/hud-store";
import { assertNever, type AgentsHealthStatus, type PanelId } from "@/lib/types";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now.toISOString().slice(11, 19);
}

function Corner({ className }: { className: string }) {
  return <div className={`hud-corner ${className}`} aria-hidden />;
}

function agentTone(status: AgentsHealthStatus) {
  switch (status) {
    case "ok":
      return "ok";
    case "down":
      return "down";
    case "checking":
      return "checking";
    case "unset":
      return "unset";
    default:
      return assertNever(status);
  }
}

function agentLabel(status: AgentsHealthStatus) {
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

function Panel({
  id,
  children,
  align,
}: {
  id: PanelId;
  children: ReactNode;
  align: "left" | "right" | "bottom";
}) {
  const open = useHud((state) => state.panels[id]);
  if (!open) return null;
  return (
    <section className={`hud-panel hud-frame hud-panel-${align}`} data-panel={id}>
      <header className="hud-panel-head">
        <span>{panelLabel(id)}</span>
        <i />
      </header>
      {children}
    </section>
  );
}

function SystemsBody() {
  const scene = useHud((state) => state.scene);
  const camera = useHud((state) => state.camera);
  const theme = SCENES[scene];
  const reactor = Math.round(theme.energy * 98 + 1);
  const rows = [
    ["REACTOR", `${reactor}%`],
    ["RING RPM", `${(theme.ringSpeed * 240).toFixed(1)}`],
    ["CORE SPIN", `${theme.coreSpeed.toFixed(2)}`],
    ["RANGE", `${camera.distance.toFixed(1)}m`],
    ["YAW", `${camera.yaw.toFixed(2)}`],
    ["PITCH", `${camera.pitch.toFixed(2)}`],
  ];
  return (
    <>
      <dl className="hud-metrics">
        {rows.map(([k, v]) => (
          <div key={k} className="hud-metric">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="hud-progress">
        <div className="hud-progress-label">
          <span>CORE FLUX</span>
          <span>{reactor}%</span>
        </div>
        <div className="hud-bar" aria-hidden>
          <i style={{ width: `${reactor}%` }} />
        </div>
      </div>
    </>
  );
}

function AgentsBody() {
  const agents = useHud((state) => state.agents);
  const tone = agentTone(agents.status);
  const label = agentLabel(agents.status);

  return (
    <article className={`hud-lane hud-lane-${tone}`}>
      <div className="hud-lane-id">CH-AGENTS</div>
      <div className="hud-lane-title">COMMAND UPLINK</div>
      <p className="hud-lane-detail hud-mono">
        {agents.url ?? "SET NEXT_PUBLIC_AGENTS_URL"}
      </p>
      <p className="hud-lane-detail">{agents.detail}</p>
      <div className="hud-lane-meta">
        <span className={`hud-state hud-state-${tone}`}>{label}</span>
        <span className="hud-mono dim">
          LAT {agents.latencyMs == null ? "—" : `${agents.latencyMs}ms`}
        </span>
      </div>
    </article>
  );
}

function CommsBody() {
  const log = useHud((state) => state.log);
  return (
    <ol className="hud-feed">
      {log.map((entry) => (
        <li key={entry.id} className="hud-event">
          <time>{new Date(entry.at).toISOString().slice(11, 19)}</time>
          <span>{entry.text}</span>
        </li>
      ))}
    </ol>
  );
}

function TelemetryBody() {
  const energy = useHud((state) => SCENES[state.scene].energy);
  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 90);
    return () => window.clearInterval(timer);
  }, []);
  const flux = Math.round(energy * 100);

  return (
    <div className="hud-tele">
      <div className="hud-progress">
        <div className="hud-progress-label">
          <span>WAVEBAND</span>
          <span>{flux}%</span>
        </div>
        <div className="hud-bar" aria-hidden>
          <i style={{ width: `${flux}%` }} />
        </div>
      </div>
      <div className="hud-wave" aria-hidden>
        {bars.map((bar) => {
          const h = 18 + ((Math.sin(tick * 0.28 + bar * 0.55) + 1) * 26 + bar * energy) % 42;
          return <i key={bar} style={{ height: `${h}%` }} />;
        })}
      </div>
    </div>
  );
}

export function Overlay() {
  const clock = useClock();
  const scene = useHud((state) => state.scene);
  const lastCommand = useHud((state) => state.lastCommand);
  const streamDeck = useHud((state) => state.streamDeck);
  const agents = useHud((state) => state.agents);
  const camera = useHud((state) => state.camera);
  const booted = useHud((state) => state.booted);
  const dispatch = useHud((state) => state.dispatch);
  const theme = SCENES[scene];
  const hid = isHidSupported();
  const [error, setError] = useState<string | null>(null);
  const agentsChip = agentLabel(agents.status);

  async function onConnect() {
    setError(null);
    try {
      await connectStreamDeck();
    } catch (err) {
      setError(err instanceof Error ? err.message : "HID denied");
    }
  }

  return (
    <div className={`hud-overlay ${booted ? "is-live" : "is-booting"}`}>
      <div className="hud-grid" aria-hidden />
      <div className="hud-scanlines" aria-hidden />
      <div className="hud-scan-beam" aria-hidden />
      <div className="hud-sweep" aria-hidden />
      <div className="hud-grain" aria-hidden />
      <Corner className="tl" />
      <Corner className="tr" />
      <Corner className="bl" />
      <Corner className="br" />
      <div className="hud-reticle" />

      <header className="hud-top hud-frame">
        <div className="hud-brand">
          <span className="hud-eyebrow">SCHERZO · COMMAND</span>
          <strong>J.A.R.V.I.S</strong>
          <i className="hud-ticks" aria-hidden />
          <div className="hud-pills">
            <span className={`hud-chip ${streamDeck.connected ? "ok" : "dim"}`}>
              HID {streamDeck.connected ? "LIVE" : "IDLE"}
            </span>
            <span className={`hud-chip hud-chip-${agentTone(agents.status)}`}>
              AGENTS {agentsChip}
            </span>
          </div>
        </div>
        <div className="hud-scenes">
          {SCENE_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === scene ? "is-active" : undefined}
              onClick={() => dispatch({ type: "scene", scene: item.id }, "UI")}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="hud-clock">
          <span className="hud-label">ZULU</span>
          <strong>{clock}</strong>
          <em>{theme.callsign}</em>
        </div>
      </header>

      <div className="hud-left hud-rail">
        <Panel id="systems" align="left">
          <SystemsBody />
        </Panel>
        <Panel id="comms" align="left">
          <CommsBody />
        </Panel>
      </div>

      <div className="hud-right hud-rail">
        <Panel id="agents" align="right">
          <AgentsBody />
        </Panel>
        <Panel id="telemetry" align="right">
          <TelemetryBody />
        </Panel>
      </div>

      <footer className="hud-bottom">
        <div className="hud-command hud-frame">
          <span className="hud-label">LAST DIRECTIVE</span>
          <strong>{lastCommand}</strong>
        </div>
        <div className="hud-deck hud-frame">
          <div>
            <span className="hud-label">STREAM DECK</span>
            <strong className={streamDeck.connected ? "ok" : undefined}>
              {streamDeck.connected ? streamDeck.productName : "OFFLINE"}
            </strong>
            <em>{streamDeck.lastLabel}</em>
          </div>
          <button type="button" onClick={() => void onConnect()} disabled={!hid}>
            {streamDeck.connected ? "RELINK" : "CONNECT HID"}
          </button>
        </div>
        <div className="hud-orbit hud-frame">
          <span className="hud-label">RIG</span>
          <strong>{camera.autoOrbit ? "AUTO ORBIT" : "MANUAL"}</strong>
          {error ? <em>{error}</em> : null}
          {!hid ? <em>WebHID needs Chrome / Edge on HTTPS</em> : null}
        </div>
      </footer>
    </div>
  );
}
