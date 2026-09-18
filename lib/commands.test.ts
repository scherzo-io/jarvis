import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  commandForKeyboard,
  commandForStreamDeckKey,
  describeCommand,
  isHoldable,
  KEYBOARD_MAP,
  STREAM_DECK_MAP,
} from "./commands";
import { CAMERA_MOVES, type CameraMove, type Command } from "./types";

/**
 * README Stream Deck contract (not a copy of STREAM_DECK_MAP).
 * 15-key 5×3 is 0–14; XL extras 15–16 are zoom. Key 3 is scene `wide`
 * (label COMMAND). Indices are 0-based, left-to-right, top-to-bottom.
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

const DOCUMENTED_INDEXES = Object.keys(DOCUMENTED_STREAM_DECK_COMMANDS)
  .map(Number)
  .sort((a, b) => a - b);

const HOLDABLE_CAMERA_MOVES = new Set<CameraMove>([
  "yawLeft",
  "yawRight",
  "pitchUp",
  "pitchDown",
  "zoomIn",
  "zoomOut",
]);

const DOCUMENTED_KEYBOARD_COMMANDS: Record<string, Command> = {
  Digit1: { type: "scene", scene: "core" },
  Digit2: { type: "scene", scene: "orbit" },
  Digit3: { type: "scene", scene: "tactical" },
  Digit4: { type: "scene", scene: "wide" },
  Digit5: { type: "scene", scene: "pulse" },
  ArrowLeft: { type: "camera", move: "yawLeft" },
  ArrowRight: { type: "camera", move: "yawRight" },
  ArrowUp: { type: "camera", move: "pitchUp" },
  ArrowDown: { type: "camera", move: "pitchDown" },
  KeyR: { type: "camera", move: "reset" },
  Space: { type: "camera", move: "toggleAutoOrbit" },
  Equal: { type: "camera", move: "zoomIn" },
  Minus: { type: "camera", move: "zoomOut" },
  KeyQ: { type: "panel", panel: "systems" },
  KeyA: { type: "panel", panel: "agents" },
  KeyC: { type: "panel", panel: "comms" },
  KeyT: { type: "panel", panel: "telemetry" },
};

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
    assert.deepEqual(keys, DOCUMENTED_INDEXES);
  });
});

describe("isHoldable camera moves", () => {
  test("yaw / pitch / zoom keys are holdable", () => {
    const holdableIndexes = DOCUMENTED_INDEXES.filter((index) => {
      const expected = DOCUMENTED_STREAM_DECK_COMMANDS[index];
      return expected.type === "camera" && HOLDABLE_CAMERA_MOVES.has(expected.move);
    });
    assert.deepEqual(holdableIndexes, [5, 6, 8, 9, 15, 16]);
    for (const index of holdableIndexes) {
      const command = commandForStreamDeckKey(index);
      assert.deepEqual(command, DOCUMENTED_STREAM_DECK_COMMANDS[index], `key ${index}`);
      assert.ok(command, `key ${index} should resolve`);
      assert.equal(isHoldable(command), true, `key ${index}`);
    }
  });

  test("only yaw / pitch / zoom camera moves are holdable", () => {
    for (const move of CAMERA_MOVES) {
      assert.equal(
        isHoldable({ type: "camera", move }),
        HOLDABLE_CAMERA_MOVES.has(move),
        move,
      );
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
    for (const index of DOCUMENTED_INDEXES) {
      const expected = DOCUMENTED_STREAM_DECK_COMMANDS[index];
      if (expected.type === "camera") {
        continue;
      }
      const command = commandForStreamDeckKey(index);
      assert.ok(command, `key ${index}`);
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
  test("every documented keyboard code resolves to the README fallback command", () => {
    const codes = Object.keys(DOCUMENTED_KEYBOARD_COMMANDS).sort();
    assert.deepEqual(Object.keys(KEYBOARD_MAP).sort(), codes);
    for (const [code, expected] of Object.entries(DOCUMENTED_KEYBOARD_COMMANDS)) {
      assert.deepEqual(commandForKeyboard(code), expected, code);
    }
  });

  test("unknown keyboard codes return null", () => {
    assert.equal(commandForKeyboard("KeyZ"), null);
    assert.equal(commandForKeyboard(""), null);
  });
});
