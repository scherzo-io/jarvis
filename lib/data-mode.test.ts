import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DATA_MODE_STORAGE_KEY,
  liveUplinkFault,
  liveUplinkFaultMessage,
  parseDataMode,
  persistDataMode,
  readStoredDataMode,
  resolveDefaultDataMode,
  withLiveFault,
} from "./data-mode.ts";

describe("parseDataMode", () => {
  it("accepts demo and live only", () => {
    assert.equal(parseDataMode("demo"), "demo");
    assert.equal(parseDataMode("live"), "live");
    assert.equal(parseDataMode("sample"), null);
    assert.equal(parseDataMode(""), null);
    assert.equal(parseDataMode(null), null);
  });
});

describe("resolveDefaultDataMode", () => {
  it("starts in demo when the agents URL is unset", () => {
    assert.equal(
      resolveDefaultDataMode({ agentsUrl: null, agentsStatus: "ok" }),
      "demo",
    );
    assert.equal(
      resolveDefaultDataMode({ agentsUrl: "   ", agentsStatus: "ok" }),
      "demo",
    );
  });

  it("starts in demo when agents health is unset or down", () => {
    assert.equal(
      resolveDefaultDataMode({
        agentsUrl: "https://agents.example",
        agentsStatus: "unset",
      }),
      "demo",
    );
    assert.equal(
      resolveDefaultDataMode({
        agentsUrl: "https://agents.example",
        agentsStatus: "down",
      }),
      "demo",
    );
  });

  it("starts in demo when health is still checking", () => {
    assert.equal(
      resolveDefaultDataMode({
        agentsUrl: "https://agents.example",
        agentsStatus: "checking",
      }),
      "demo",
    );
  });

  it("starts live only when the URL is set and health is ok", () => {
    assert.equal(
      resolveDefaultDataMode({
        agentsUrl: "https://agents.example",
        agentsStatus: "ok",
      }),
      "live",
    );
  });
});

describe("liveUplinkFault", () => {
  it("is clear when live is selected without an agents URL", () => {
    assert.equal(
      liveUplinkFault({
        mode: "live",
        agentsUrl: null,
        agentsStatus: "unset",
      }),
      "missing",
    );
    assert.match(
      liveUplinkFaultMessage("missing"),
      /NEXT_PUBLIC_AGENTS_URL/,
    );
  });

  it("is clear when live is selected and the uplink is down or unset", () => {
    assert.equal(
      liveUplinkFault({
        mode: "live",
        agentsUrl: "https://agents.example",
        agentsStatus: "down",
      }),
      "down",
    );
    assert.equal(
      liveUplinkFault({
        mode: "live",
        agentsUrl: "https://agents.example",
        agentsStatus: "unset",
      }),
      "down",
    );
    assert.match(liveUplinkFaultMessage("down"), /down|FAULT|unlinked/i);
  });

  it("is silent in demo and when live uplink is reachable", () => {
    assert.equal(
      liveUplinkFault({
        mode: "demo",
        agentsUrl: null,
        agentsStatus: "unset",
      }),
      null,
    );
    assert.equal(
      liveUplinkFault({
        mode: "live",
        agentsUrl: "https://agents.example",
        agentsStatus: "ok",
      }),
      null,
    );
    assert.equal(
      liveUplinkFault({
        mode: "live",
        agentsUrl: "https://agents.example",
        agentsStatus: "checking",
      }),
      null,
    );
  });
});

describe("session persistence", () => {
  it("reads and writes the session key without inventing values", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem(key: string) {
        return memory.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        memory.set(key, value);
      },
    };

    assert.equal(readStoredDataMode(storage), null);
    persistDataMode(storage, "live");
    assert.equal(memory.get(DATA_MODE_STORAGE_KEY), "live");
    assert.equal(readStoredDataMode(storage), "live");
  });

  it("ignores missing or throwing storage", () => {
    assert.equal(readStoredDataMode(null), null);
    persistDataMode(null, "demo");

    const throwing = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };
    assert.equal(readStoredDataMode(throwing), null);
    persistDataMode(throwing, "live");
  });
});

describe("withLiveFault", () => {
  it("marks live readouts as FAULT without switching back to demo", () => {
    const patched = withLiveFault(
      {
        agentsLabel: "ONLINE",
        agentsTone: "ok" as const,
        agentsDetail: "healthy",
        uplinkFault: null,
        uplinkFaultMessage: null,
      },
      "missing",
    );

    assert.equal(patched.agentsLabel, "FAULT");
    assert.equal(patched.agentsTone, "down");
    assert.match(patched.agentsDetail, /NEXT_PUBLIC_AGENTS_URL/);
    assert.equal(patched.uplinkFault, "missing");
  });

  it("leaves readouts unchanged when there is no fault", () => {
    const input = {
      agentsLabel: "ONLINE",
      agentsTone: "ok" as const,
      agentsDetail: "healthy",
      uplinkFault: null,
      uplinkFaultMessage: null,
    };
    assert.deepEqual(withLiveFault(input, null), input);
  });
});
