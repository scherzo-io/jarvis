import { useHud } from "./hud-store";

const POLL_MS = 15_000;

function agentsBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_AGENTS_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

function healthUrl(base: string): string {
  return `${base}/api/health`;
}

export async function probeAgentsHealth(): Promise<void> {
  const base = agentsBaseUrl();
  if (!base) {
    useHud.getState().setAgents({
      status: "unset",
      latencyMs: null,
      detail: "NEXT_PUBLIC_AGENTS_URL not set",
      url: null,
    });
    return;
  }

  const url = healthUrl(base);
  useHud.getState().setAgents({ status: "checking", url });
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json, text/plain;q=0.9,*/*;q=0.8" },
    });
    const latencyMs = Math.round(performance.now() - started);
    const body = await response.text();
    const snippet = body.replace(/\s+/g, " ").slice(0, 140);
    const ok = response.ok;

    useHud.getState().setAgents({
      status: ok ? "ok" : "down",
      latencyMs,
      detail: snippet || `${response.status} ${response.statusText}`,
      checkedAt: Date.now(),
      url,
    });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - started);
    const detail = error instanceof Error ? error.message : "Unreachable";
    useHud.getState().setAgents({
      status: "down",
      latencyMs,
      detail,
      checkedAt: Date.now(),
      url,
    });
  }
}

export function startAgentsHealthLoop(): () => void {
  void probeAgentsHealth();
  const timer = window.setInterval(() => {
    void probeAgentsHealth();
  }, POLL_MS);
  return () => window.clearInterval(timer);
}
