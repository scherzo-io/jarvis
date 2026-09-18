# Receipt: Stream Deck map / WebHID QA

Machine-checkable button↔action map for Jarvis HUD. **No Elgato hardware, WebHID, or `navigator.hid` required.**

Scope: `lib/commands.ts` (`STREAM_DECK_MAP`, `commandForStreamDeckKey`, `isHoldable`, `describeCommand`, keyboard helpers). Live HID I/O in `lib/stream-deck.ts` is out of band for this receipt.

Map vs README (2026-09-18): **match** — no map or README semantic change. Key 3 is scene `wide` (label **COMMAND**). Keys 15–16 are XL zoom extras. Holdables are yaw / pitch / zoom only (not reset / auto orbit).

## Install and run

From the repo root:

```bash
npm install
npm test
```

`npm test` runs two Node suites in order:

1. Main’s shell contract tests: `node --experimental-strip-types --test components/shell/*.test.ts`
2. This receipt’s Stream Deck map tests: `tsx --test lib/commands.test.ts` (pinned path, not a glob, so a missing file fails instead of exiting 0 on an empty suite)

`tsx` is required for `lib/commands.ts` because production uses extensionless TS imports that native type-stripping cannot resolve. Tests stay on Node; they never open a browser or request HID.

After rebase onto main (PRs #5 / #6), `npm test` is a combined runner. The Stream Deck slice is still 11 tests. A red shell suite also fails this command (exit non-zero).

## Pass criteria

| Check | Expected |
| --- | --- |
| Exit code | `0` (both suites) |
| Stream Deck TAP | `# tests 11`, `# fail 0` from `lib/commands.test.ts` |
| Shell TAP | `# fail 0` (count owned by the shell lane; 9 tests on 2026-09-18) |
| Failures | `0` |
| Hardware / WebHID | Not used. A missing `navigator.hid` must not fail this suite. |
| Documented keys `0`–`14` | Resolve to README 15-key map (scenes, camera holds, panels, auto orbit) |
| XL extras `15`–`16` | `zoomIn` / `zoomOut` |
| Unknown / out-of-range keys | `commandForStreamDeckKey` returns `null` (includes XL keys `17+`) |
| Holdable moves | Yaw / pitch / zoom only; `reset` and `toggleAutoOrbit` are not holdable |
| `describeCommand` | Stable labels listed in `lib/commands.test.ts` |

If `npm test` exits non-zero, this receipt **fails**. Do not treat a red suite as a soft-fail.

## Manual soft-fail checklist (no hardware)

These are observational only. They do **not** gate the automated receipt.

Use a browser **without** WebHID (Firefox / Safari, or Chrome/Edge on non-HTTPS, non-localhost). Keyboard still uses `KEYBOARD_MAP` via `InputBridge`.

- [ ] HUD loads; Stream Deck status is **OFFLINE**
- [ ] **CONNECT HID** is disabled (`disabled` when `navigator.hid` is absent)
- [ ] Copy shown: `WebHID needs Chrome / Edge on HTTPS`
- [ ] Keyboard fallback still works: `1`–`5` scenes, arrows orbit, `R` reset, `Space` auto orbit, `+`/`-` zoom, `Q`/`A`/`C`/`T` panels
- [ ] LAST DIRECTIVE / command log updates from keyboard (source `KEY`)

If CONNECT is enabled in a WebHID browser but no device is present, deny or cancel the picker — that is also a soft-fail, not a receipt failure.

## Physical Elgato (optional, out of band)

A real Stream Deck (vendor `0x0FD9`) is **not** part of this receipt. Chrome/Edge on HTTPS or localhost, then **CONNECT HID**, is a separate hardware pass. Do not block this QA slice on device availability.

## Files

- Tests: `lib/commands.test.ts`
- Map: `lib/commands.ts`
- Product copy: `README.md` (Stream Deck section)
- HID bridge (not executed here): `lib/stream-deck.ts`, `components/hud/Overlay.tsx`, `components/hud/InputBridge.tsx`
