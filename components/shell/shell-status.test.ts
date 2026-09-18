import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  agentsStatusLabel,
  buildShellReadouts,
  formatClock,
  formatFeedLines,
  resolveShellRail,
} from "./shell-status.ts";
import { SHELL_REGIONS } from "./shell-contract.ts";

describe("shell regions", () => {
  it("declares dashboard grid regions for Visual to fill", () => {
    assert.deepEqual([...SHELL_REGIONS], [
      "root",
      "topbar",
      "main",
      "stage",
      "rail",
      "feed",
    ]);
  });
});

describe("agentsStatusLabel", () => {
  it("maps store health to readout pills", () => {
    assert.equal(agentsStatusLabel("ok"), "ONLINE");
    assert.equal(agentsStatusLabel("down"), "FAULT");
    assert.equal(agentsStatusLabel("checking"), "PING");
    assert.equal(agentsStatusLabel("unset"), "UNLINKED");
  });
});

describe("formatClock", () => {
  it("formats UTC HH:MM:SS from a Date", () => {
    assert.equal(formatClock(new Date("2026-09-18T08:33:07.000Z")), "08:33:07");
  });
});

describe("formatFeedLines", () => {
  it("returns empty when the store log is empty", () => {
    assert.deepEqual(formatFeedLines([]), []);
  });

  it("keeps newest lines first and caps the feed", () => {
    const log = [
      { id: 2, at: Date.parse("2026-09-18T08:33:07.000Z"), text: "KEY · ORBITAL" },
      { id: 1, at: Date.parse("2026-09-18T08:32:01.000Z"), text: "HID CHANNEL IDLE" },
      { id: 0, at: Date.parse("2026-09-18T08:31:00.000Z"), text: "JARVIS KERNEL AWAKE" },
    ];

    assert.deepEqual(formatFeedLines(log, 2), [
      { id: 2, time: "08:33:07", text: "KEY · ORBITAL" },
      { id: 1, time: "08:32:01", text: "HID CHANNEL IDLE" },
    ]);
  });
});

describe("buildShellReadouts", () => {
  it("projects store signals without inventing lane telemetry", () => {
    const readouts = buildShellReadouts({
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
    });

    assert.equal(readouts.brand, "J.A.R.V.I.S");
    assert.equal(readouts.sceneLabel, "ORBITAL");
    assert.equal(readouts.sceneCallsign, "STANDARD");
    assert.equal(readouts.agentsLabel, "ONLINE");
    assert.equal(readouts.agentsTone, "ok");
    assert.equal(readouts.agentsDetail, "healthy");
    assert.equal(readouts.lastCommand, "KEY · ORBITAL");
    assert.equal(readouts.feed.length, 1);
    assert.equal(readouts.feed[0]?.text, "KEY · ORBITAL");
  });
});

describe("resolveShellRail", () => {
  it("keeps the rail slot when omitted so Visual can migrate panels", () => {
    assert.equal(resolveShellRail(undefined), "default");
  });

  it("hides the rail when the caller passes false", () => {
    assert.equal(resolveShellRail(false), "hidden");
  });

  it("uses a custom rail node when provided", () => {
    assert.equal(resolveShellRail("panels"), "custom");
  });
});
