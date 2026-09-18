# Reference only — `scherzo-io/jarvis-claude-code`

**Status:** Inspiration / spec for Vercel Jarvis. **Not** merge scope. **Not** a second product lane.
**Source:** https://github.com/scherzo-io/jarvis-claude-code  
**Decision (Etch 2026-09-18):** keep separate; borrow UX/feel, do not port the local Claude Code stack into `jarvis` / `jarvis-agents`.

## What the original is

Local-first **voice + memory-graph HUD** for Claude Code:

- Brain = user's `claude` CLI (subscription), not hosted API keys
- Memory = markdown vault (`[[wikilinks]]`), Obsidian-friendly
- Server binds `127.0.0.1` only
- Optional Fish Audio TTS (`[stage directions]` performed, not spoken)

## Layout / UX to steal (visual + interaction)

Three-column command deck:

| Zone | Pattern |
| --- | --- |
| **Top bar** | Brand + mini reactor + status pills (Gateway / Brain / Voice) |
| **Left rail** | Inspector (focused note), Command Matrix, Top Hubs |
| **Center** | Graph canvas + reactor halo + conversation transcript + Ask bar (text + mic) |
| **Right rail** | Type filters, voice dial / VU / tone, Action Log + session telemetry |

Graph behaviors worth copying into cinematic HUD language:

- Click node → focus ego-neighborhood; inspector shows note body
- Shift-click second node → shortest path highlight
- Fit / labels / contrast tools on stage
- Filter by vault type (client, project, call, …)

Palette cues (reference, not mandate): near-black void, cyan telemetry (`#5fe4ff`), amber warnings, green OK, mono type, faint grid, glow panels.

## What Vercel Jarvis already owns (do not replace)

- Cinematic Three.js / R3F HUD on Vercel (`jarvis`)
- Stream Deck via **WebHID** (not local Python)
- Optional agents uplink via `NEXT_PUBLIC_AGENTS_URL` → `jarvis-agents` health/control
- No auth v0, prod-hosted

## Borrow list (safe for later slices — Lead must GO each)

1. **Status pills** — Gateway / brain / voice-or-HID / agents link state on the HUD chrome
2. **Inspector pattern** — select a system/agent/scene → readable detail panel (not only metrics)
3. **Action / telemetry log** — live directive feed (already partially present)
4. **Ask / transmit bar** — if/when chat or agent directives enter scope (not Slice 0)
5. **Graph-as-memory metaphor** — only if product one-liner calls for it; do not invent vault/voice without Etch

## Explicit non-goals (reference phase)

- No Fish Audio / Claude CLI / local vault in Vercel apps
- No binding to localhost as primary UX
- No silent merge of `jarvis-claude-code` into `scherzo-io/jarvis`
- Product marketing one-liner still **OPEN** — this doc does not invent it

## Owners

- **Lead** — keeps this reference authoritative; assigns slices from Borrow list
- **App Builder** — may use for HUD chrome/feel; no port of local stack
- **Agents Builder** — out of scope unless Lead assigns a control/event slice
- **Ship / QA** — no deploy/gate change from this doc alone
