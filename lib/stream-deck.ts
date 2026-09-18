import { commandForStreamDeckKey, describeCommand, isHoldable } from "./commands";
import { useHud } from "./hud-store";
import type { Command } from "./types";

export const ELGATO_VENDOR_ID = 0x0fd9;

type DeckProfile = {
  keys: number;
  columns: number;
  rows: number;
  offset: number;
};

const PROFILES: Record<number, DeckProfile> = {
  0x0060: { keys: 15, columns: 5, rows: 3, offset: 3 },
  0x0063: { keys: 6, columns: 3, rows: 2, offset: 3 },
  0x006c: { keys: 32, columns: 8, rows: 4, offset: 3 },
  0x006d: { keys: 15, columns: 5, rows: 3, offset: 3 },
  0x0080: { keys: 15, columns: 5, rows: 3, offset: 3 },
  0x0084: { keys: 8, columns: 4, rows: 2, offset: 3 },
  0x0086: { keys: 3, columns: 3, rows: 1, offset: 3 },
  0x0090: { keys: 8, columns: 4, rows: 2, offset: 3 },
  0x00aa: { keys: 15, columns: 5, rows: 3, offset: 3 },
  0x00ab: { keys: 32, columns: 8, rows: 4, offset: 3 },
};

const DEFAULT_PROFILE: DeckProfile = { keys: 15, columns: 5, rows: 3, offset: 3 };

export function isHidSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.hid);
}

export function profileForProduct(productId: number): DeckProfile {
  return PROFILES[productId] ?? DEFAULT_PROFILE;
}

function readKeyStates(bytes: Uint8Array, profile: DeckProfile): boolean[] {
  const candidates = [profile.offset, 2, 3, 4, 1, 0];
  for (const offset of candidates) {
    if (offset + profile.keys > bytes.length) continue;
    const slice = bytes.subarray(offset, offset + profile.keys);
    if (slice.every((value) => value === 0 || value === 1)) {
      return Array.from(slice, (value) => value === 1);
    }
  }

  const states = Array.from({ length: profile.keys }, () => false);
  const limit = Math.min(bytes.length, profile.keys);
  for (let i = 0; i < limit; i += 1) {
    states[i] = bytes[i] !== 0;
  }
  return states;
}

type DeckSession = {
  device: HIDDevice;
  previous: boolean[];
  holds: Map<number, number>;
  onReport: (event: HIDInputReportEvent) => void;
};

let session: DeckSession | null = null;

function clearHolds(holds: Map<number, number>) {
  for (const timer of holds.values()) {
    window.clearInterval(timer);
  }
  holds.clear();
}

function startHold(index: number, command: Command, holds: Map<number, number>) {
  if (holds.has(index) || !isHoldable(command) || command.type !== "camera") return;
  const move = command.move;
  const timer = window.setInterval(() => {
    useHud.getState().nudgeCamera(move, 1);
  }, 32);
  holds.set(index, timer);
}

function stopHold(index: number, holds: Map<number, number>) {
  const timer = holds.get(index);
  if (timer === undefined) return;
  window.clearInterval(timer);
  holds.delete(index);
}

function handleStates(states: boolean[], previous: boolean[], holds: Map<number, number>) {
  const count = Math.max(states.length, previous.length);
  for (let index = 0; index < count; index += 1) {
    const down = Boolean(states[index]);
    const wasDown = Boolean(previous[index]);
    if (down === wasDown) continue;

    const command = commandForStreamDeckKey(index);
    if (!command) continue;

    if (down) {
      useHud.getState().dispatch(command, `DECK ${String(index).padStart(2, "0")}`);
      useHud.getState().setStreamDeck({
        lastKey: index,
        lastLabel: describeCommand(command),
      });
      startHold(index, command, holds);
    } else {
      stopHold(index, holds);
    }
  }
}

function attachDevice(device: HIDDevice) {
  detachDevice();

  const profile = profileForProduct(device.productId);
  const holds = new Map<number, number>();
  const previous = Array.from({ length: profile.keys }, () => false);

  const onReport = (event: HIDInputReportEvent) => {
    const bytes = new Uint8Array(
      event.data.buffer,
      event.data.byteOffset,
      event.data.byteLength,
    );
    const states = readKeyStates(bytes, profile);
    handleStates(states, previous, holds);
    for (let i = 0; i < states.length; i += 1) {
      previous[i] = states[i];
    }
  };

  device.addEventListener("inputreport", onReport);
  session = { device, previous, holds, onReport };

  useHud.getState().setStreamDeck({
    connected: true,
    productName: device.productName || `ELGATO ${device.productId.toString(16)}`,
    productId: device.productId,
    keyCount: profile.keys,
    lastLabel: "LINK ESTABLISHED",
  });
}

export function detachDevice() {
  if (!session) return;
  session.device.removeEventListener("inputreport", session.onReport);
  clearHolds(session.holds);
  void session.device.close().catch(() => undefined);
  session = null;
  useHud.getState().setStreamDeck({
    connected: false,
    productName: "NONE",
    productId: null,
    keyCount: 0,
    lastLabel: "DISCONNECTED",
  });
}

export async function connectStreamDeck(): Promise<void> {
  if (!isHidSupported() || !navigator.hid) {
    throw new Error("WebHID is not available in this browser");
  }

  const granted = await navigator.hid.requestDevice({
    filters: [{ vendorId: ELGATO_VENDOR_ID }],
  });
  const device = granted[0];
  if (!device) return;
  if (!device.opened) {
    await device.open();
  }
  attachDevice(device);
}

export async function restoreStreamDeck(): Promise<void> {
  if (!isHidSupported() || !navigator.hid) return;
  const devices = await navigator.hid.getDevices();
  const deck = devices.find((device) => device.vendorId === ELGATO_VENDOR_ID);
  if (!deck) return;
  if (!deck.opened) {
    await deck.open();
  }
  attachDevice(deck);
}
