import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  commandForKeyboard,
  commandForStreamDeckKey,
  describeCommand,
  isHoldable,
  STREAM_DECK_MAP,
} from "./commands";
import type { Command } from "./types";

/**
 * Documented 15-key (5×3) + XL zoom extras from README.
 * Indices are 0-based, left-to-right, top-to-bottom.
 */
const DOCUMENTED_STREAM_DECK_COMMANDS: Record<number, Command> = {
  0: { type: "scene", scene: "core" },
  1: { type: "scene", scene: "orbit" },
  2: { type: "scene", scene: "tactical" },
  3: { type: "scene", scene: "wide" },
  4: { type: "scene", scene: "pulse" },
  5: { type: "camera", move: "yawLeft" },
  6: { type: "camera", move: "pitchUp" },
  7: { type: "camera", move: "reset" },
  8: { type: "camera", move: "pitchDown" },
  9: { type: "camera", move: "yawRight" },
  10: { type: "panel", panel: "systems" },
  11: { type: "panel", panel: "agents" },
  12: { type: "panel", panel: "comms" },
  13: { type: "panel", panel: "telemetry" },
  14: { type: "camera", move: "toggleAutoOrbit" },
  15: { type: "camera", move: "zoomIn" },
  16: { type: "camera", move: "zoomOut" },
};

const DOCUMENTED_LABELS: Record<number, string> = {
  0: "SCENE CORE LOCK",
  1: "SCENE ORBITAL",
  2: "SCENE TACTICAL",
  3: "SCENE COMMAND",
  4: "SCENE PULSE",
  5: "CAM YAW −",
  6: "CAM PITCH +",
  7: "CAM RESET",
  8: "CAM PITCH −",
  9: "CAM YAW +",
  10: "PANEL SYSTEMS",
  11: "PANEL AGENTS",
  12: "PANEL COMMS",
  13: "PANEL TELEMETRY",
  14: "AUTO ORBIT",
  15: "CAM ZOOM IN",
  16: "CAM ZOOM OUT",
};

const HOLDABLE_KEY_INDEXES = [5, 6, 8, 9, 15, 16] as const;
const NON_HOLDABLE_KEY_INDEXES = [0, 1, 2, 3, 4, 7, 10, 11, 12, 13, 14] as const;

describe("STREAM_DECK_MAP / commandForStreamDeckKey", () => {
  test("every documented 15-key index (0–14) resolves to the README command", () => {
    for (let index = 0; index <= 14; index += 1) {
      assert.deepEqual(
        commandForStreamDeckKey(index),
        DOCUMENTED_STREAM_DECK_COMMANDS[index],
        `key ${index}`,
      );
      assert.deepEqual(
        STREAM_DECK_MAP[index],
        DOCUMENTED_STREAM_DECK_COMMANDS[index],
        `STREAM_DECK_MAP[${index}]`,
      );
    }
  });

  test("XL extras 15–16 map to zoomIn / zoomOut", () => {
    assert.deepEqual(commandForStreamDeckKey(15), {
      type: "camera",
      move: "zoomIn",
    });
    assert.deepEqual(commandForStreamDeckKey(16), {
      type: "camera",
      move: "zoomOut",
    });
  });

  test("unknown and out-of-range keys return null", () => {
    for (const index of [-1, 17, 18, 31, 32, 99, Number.NaN]) {
      assert.equal(commandForStreamDeckKey(index), null, `key ${index}`);
      assert.equal(STREAM_DECK_MAP[index], undefined, `map ${index}`);
    }
  });

  test("documented map has only keys 0–16", () => {
    const keys = Object.keys(STREAM_DECK_MAP)
      .map(Number)
      .sort((a, b) => a - b);
    assert.deepEqual(keys, [...Array.from({ length: 17 }, (_, i) => i)]);
  });
});

describe("isHoldable camera moves", () => {
  test("yaw / pitch / zoom keys are holdable", () => {
    for (const index of HOLDABLE_KEY_INDEXES) {
      const command = commandForStreamDeckKey(index);
      assert.ok(command, `key ${index} should resolve`);
      assert.equal(command.type, "camera");
      assert.ok(
        command.type === "camera" &&
          (command.move === "yawLeft" ||
            command.move === "yawRight" ||
            command.move === "pitchUp" ||
            command.move === "pitchDown" ||
            command.move === "zoomIn" ||
            command.move === "zoomOut"),
        `key ${index} should be a yaw/pitch/zoom move`,
      );
      assert.equal(isHoldable(command), true, `key ${index}`);
    }
  });

  test("reset and toggleAutoOrbit are not holdable", () => {
    const reset = commandForStreamDeckKey(7);
    const autoOrbit = commandForStreamDeckKey(14);
    assert.deepEqual(reset, { type: "camera", move: "reset" });
    assert.deepEqual(autoOrbit, { type: "camera", move: "toggleAutoOrbit" });
    assert.ok(reset);
    assert.ok(autoOrbit);
    assert.equal(isHoldable(reset), false);
    assert.equal(isHoldable(autoOrbit), false);
  });

  test("scenes and panels are not holdable", () => {
    for (const index of NON_HOLDABLE_KEY_INDEXES) {
      const command = commandForStreamDeckKey(index);
      assert.ok(command, `key ${index}`);
      if (command.type === "camera") {
        assert.ok(command.move === "reset" || command.move === "toggleAutoOrbit");
      }
      assert.equal(isHoldable(command), false, `key ${index}`);
    }
  });
});

describe("describeCommand labels", () => {
  test("labels stay stable for every documented Stream Deck key", () => {
    for (const [rawIndex, expected] of Object.entries(DOCUMENTED_LABELS)) {
      const index = Number(rawIndex);
      const command = commandForStreamDeckKey(index);
      assert.ok(command, `key ${index}`);
      assert.equal(describeCommand(command), expected, `key ${index}`);
    }
  });
});

describe("commandForKeyboard fallback helpers", () => {
  test("documented keyboard codes resolve to the same command families as the deck", () => {
    assert.deepEqual(commandForKeyboard("Digit1"), { type: "scene", scene: "core" });
    assert.deepEqual(commandForKeyboard("Digit5"), { type: "scene", scene: "pulse" });
    assert.deepEqual(commandForKeyboard("ArrowLeft"), {
      type: "camera",
      move: "yawLeft",
    });
    assert.deepEqual(commandForKeyboard("KeyR"), { type: "camera", move: "reset" });
    assert.deepEqual(commandForKeyboard("Space"), {
      type: "camera",
      move: "toggleAutoOrbit",
    });
    assert.deepEqual(commandForKeyboard("Equal"), { type: "camera", move: "zoomIn" });
    assert.deepEqual(commandForKeyboard("Minus"), { type: "camera", move: "zoomOut" });
    assert.deepEqual(commandForKeyboard("KeyQ"), { type: "panel", panel: "systems" });
  });

  test("unknown keyboard codes return null", () => {
    assert.equal(commandForKeyboard("KeyZ"), null);
    assert.equal(commandForKeyboard(""), null);
  });
});
