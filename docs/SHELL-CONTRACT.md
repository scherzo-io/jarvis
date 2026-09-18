# Shell contract (Slice 1)

App Builder owns the dashboard **layout grid** so HUD Visual can migrate chrome into slots without fighting `app/page.tsx`. This is composition only: no Streamline lanes runtime, no Python/vault/Fish Audio port.

## Regions

`JarvisShell` is a CSS grid matching the Codex orchestration HUD structure:

| `data-shell` | Zone | Default content |
| --- | --- | --- |
| `root` | Full-viewport grid | `data-shell-rail="on"` or `"off"` |
| `topbar` | Brand / clock / status readouts | Demo/Live toggle, scene label, agents pill, last directive |
| `main` | Stage + optional right rail | — |
| `stage` | Center stage | `children` — existing `JarvisHud` / World |
| `rail` | Right panel slot | Store: scene callsign + agents detail |
| `feed` | Footer event log | Last lines from `useHud().log` |

Default placeholders are marked `data-shell-slot="default"`. They are structural readouts, not Visual chrome.

## Slot props

```tsx
<JarvisShell topbar={...} rail={...} feed={...}>
  <JarvisHud />
</JarvisShell>
```

- Omit a slot → keep the default placeholder (Visual replaces later).
- Pass a node → replace that region.
- Pass `rail={false}` → hide the rail (`data-shell-rail="off"`); stage goes full width.

HID / Stream Deck stay on `InputBridge` inside `JarvisHud`. Do not move that unless Visual relocates chrome and App Builder rewires the stage child.

## Data mode (Slice 1.1)

Shell chrome reads **Demo** fixtures or **Live** store/agents. Default is Demo when `NEXT_PUBLIC_AGENTS_URL` is unset or agents health is unset/down/checking; Live only when the URL is set and health is `ok`. The toggle lives in `ShellTopbar` and persists to `sessionStorage` key `jarvis:data-mode`. Live with a missing or down uplink stays Live and shows a FAULT readout.

Fixtures: `lib/fixtures/demo-feed.json`, `lib/fixtures/demo-readouts.json`, `lib/fixtures/demo-board.json`.

## Ownership

**App Builder may edit:** `app/*`, `components/shell/*`, and `lib/agents-health.ts` / `lib/types.ts` / `lib/hud-store.ts` only if shell status wiring requires it.

**HUD Visual owns (do not edit here):** `components/hud/*`, `components/scene/*`, `app/globals.css`, Three.js / R3F / postprocessing look.

Shell CSS lives in `components/shell/shell.module.css`. It only sizes the grid and contains `.hud-root` to the stage cell (`width/height: 100%`) so the existing canvas still mounts. Visual owns density, attention-rail, and theater finish.
