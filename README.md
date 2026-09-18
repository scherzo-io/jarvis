# JARVIS

Cinematic Three.js command HUD for [scherzo-io/jarvis](https://github.com/scherzo-io/jarvis). Vercel project: `jarvis`. No auth.

Production: [https://jarvis-ten-delta-74.vercel.app](https://jarvis-ten-delta-74.vercel.app)

The deck is a dark gold / ion-teal holographic core: nested solids, orbital rings, drifting satellites, a reactor grid, and a bloomed void. Stream Deck keys (or the keyboard) drive camera, scene presets, and panel visibility.

## Run

```bash
npm install
npm run dev
```

Stream Deck map QA (no hardware):

```bash
npm test
```

Receipt: [`docs/receipts/stream-deck-map.md`](docs/receipts/stream-deck-map.md).

Production:

```bash
npm run build
npm start
```

Optional agents uplink — when set, the HUD polls `{NEXT_PUBLIC_AGENTS_URL}/api/health` every 15 seconds:

```bash
NEXT_PUBLIC_AGENTS_URL=https://your-agents-host.example
```

Copy `.env.example` to `.env.local` for local overrides.

## Stream Deck (WebHID)

Use **Chrome or Edge** on **HTTPS** (or localhost). Click **CONNECT HID** and pick the Elgato device. Previously permitted decks are restored on reload.

Vendor filter: Elgato `0x0FD9`. Layouts supported: Original / MK.2 (15), Mini (6), XL (32), Plus / Neo (8), Pedal (3). Extra keys on XL map zoom.

Keys are **0-based, left-to-right, top-to-bottom**. Hold yaw / pitch / zoom for continuous motion.

### 15-key map (5×3)

| 0 CORE LOCK | 1 ORBITAL | 2 TACTICAL | 3 COMMAND | 4 PULSE |
| --- | --- | --- | --- | --- |
| 5 YAW − | 6 PITCH + | 7 CAM RESET | 8 PITCH − | 9 YAW + |
| 10 SYSTEMS | 11 AGENTS | 12 COMMS | 13 TELEMETRY | 14 AUTO ORBIT |

### 32-key extras (XL)

| 15 ZOOM IN | 16 ZOOM OUT |
| --- | --- |

Mini / Plus / Pedal use the same index map for however many keys exist (Mini gets scenes 0–4 plus yaw on key 5).

### Keyboard fallback

| Key | Action |
| --- | --- |
| `1`–`5` | Scene presets |
| Arrow keys | Orbit camera |
| `R` | Reset camera to the current scene |
| `Space` | Toggle auto-orbit |
| `+` / `-` | Zoom |
| `Q` | Toggle systems |
| `A` | Toggle agents |
| `C` | Toggle comms |
| `T` | Toggle telemetry |

## Stack

- Next.js App Router + TypeScript
- React Three Fiber / Drei / postprocessing
- WebHID Stream Deck bridge
- Optional `NEXT_PUBLIC_AGENTS_URL` health probe
