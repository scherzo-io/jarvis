import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { buildShellReadouts } from "../components/shell/shell-status.ts";
import { withLiveFault } from "./data-mode.ts";
import { buildDemoReadouts, resolveShellView } from "./shell-data.ts";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(fixtureDir, name), "utf8"));
}

const liveReadouts = buildShellReadouts({
  sceneLabel: "ORBITAL",
  sceneCallsign: "STANDARD",
  lastCommand: "KEY · ORBITAL",
  agents: {
    status: "ok",
    latencyMs: 12,
    detail: "healthy",
    checkedAt: 1,
    url: "https://agents.example/api/health",
  },
  log: [{ id: 4, at: Date.parse("2026-09-18T08:33:07.000Z"), text: "KEY · ORBITAL" }],
  metrics: [{ id: "range", label: "RANGE", value: "9.2m" }],
  board: [],
  dataMode: "live",
});

describe("demo fixtures", () => {
  it("keeps feed, readouts, and board as small static JSON", () => {
    const feed = readJson("demo-feed.json");
    const readouts = readJson("demo-readouts.json");
    const board = readJson("demo-board.json");

    assert.ok(Array.isArray(feed));
    assert.ok((feed as unknown[]).length >= 2);
    assert.ok(
      (feed as { text: string }[]).every((row) => /DEMO|SAMPLE|FIXTURE/.test(row.text)),
    );

    assert.equal(typeof readouts, "object");
    const sceneLabel = (readouts as { sceneLabel: string }).sceneLabel;
    assert.match(sceneLabel, /SAMPLE|DEMO|FIXTURE/);

    const lanes = (board as { lanes: unknown[] }).lanes;
    assert.ok(Array.isArray(lanes));
    assert.ok(lanes.length >= 1);
  });

  it("matches the projected demo view to the JSON fixtures", () => {
    const feed = readJson("demo-feed.json") as { text: string }[];
    const readoutsJson = readJson("demo-readouts.json") as {
      sceneLabel: string;
      lastCommand: string;
      metrics: { id: string; value: string }[];
    };
    const board = readJson("demo-board.json") as {
      lanes: { id: string; title: string }[];
    };
    const view = buildDemoReadouts();

    assert.equal(view.sceneLabel, readoutsJson.sceneLabel);
    assert.equal(view.lastCommand, readoutsJson.lastCommand);
    for (const row of feed) {
      assert.ok(view.feed.some((line) => line.text === row.text));
    }
    for (const metric of readoutsJson.metrics) {
      assert.ok(view.metrics.some((row) => row.id === metric.id && row.value === metric.value));
    }
    for (const lane of board.lanes) {
      assert.ok(view.board.some((row) => row.id === lane.id && row.title === lane.title));
    }
  });
});

describe("buildDemoReadouts", () => {
  it("projects fixture feed, metrics, and board — not the live store", () => {
    const readouts = buildDemoReadouts();
    assert.equal(readouts.dataMode, "demo");
    assert.equal(readouts.uplinkFault, null);
    assert.match(readouts.sceneLabel, /SAMPLE|DEMO|FIXTURE/);
    assert.ok(readouts.feed.some((line) => /DEMO|SAMPLE|FIXTURE/.test(line.text)));
    assert.ok(readouts.metrics.length > 0);
    assert.ok(readouts.board.length > 0);
    assert.ok(!readouts.feed.some((line) => line.text === "KEY · ORBITAL"));
  });
});

describe("resolveShellView", () => {
  it("uses fixtures in demo and the store in live", () => {
    const demo = resolveShellView({ mode: "demo", live: liveReadouts });
    const live = resolveShellView({ mode: "live", live: liveReadouts });

    assert.equal(demo.dataMode, "demo");
    assert.match(demo.sceneLabel, /SAMPLE|DEMO|FIXTURE/);
    assert.ok(demo.board.length > 0);

    assert.equal(live.dataMode, "live");
    assert.equal(live.sceneLabel, "ORBITAL");
    assert.equal(live.feed[0]?.text, "KEY · ORBITAL");
    assert.equal(live.uplinkFault, null);
  });

  it("keeps live selected and surfaces a fault when the uplink is missing", () => {
    const view = withLiveFault(
      resolveShellView({
        mode: "live",
        live: buildShellReadouts({
          ...liveReadouts,
          sceneLabel: liveReadouts.sceneLabel,
          sceneCallsign: liveReadouts.sceneCallsign,
          lastCommand: liveReadouts.lastCommand,
          agents: {
            status: "unset",
            latencyMs: null,
            detail: "NEXT_PUBLIC_AGENTS_URL not set",
            checkedAt: null,
            url: null,
          },
          log: [],
          dataMode: "live",
        }),
      }),
      "missing",
    );

    assert.equal(view.dataMode, "live");
    assert.equal(view.uplinkFault, "missing");
    assert.equal(view.agentsTone, "down");
    assert.equal(view.agentsLabel, "FAULT");
    assert.match(view.uplinkFaultMessage ?? "", /NEXT_PUBLIC_AGENTS_URL/);
  });
});
