# TASK_QUEUE.md — Autonomous Execution Queue (Argon + Astra)

> **Protocol:** Claim one task at a time as `[WIP: ARGON]`. Follow `AGENTS.md` and `.agents/agents/foreman.md`. Limit Codex review calls (`codex exec`) to 1 call per completed milestone and observe the 120s cooldown between tasks.

## Milestone 1: Visual Restoration & Side-by-Side Alignment (Codex Baseline vs. AG Redesign)
- [x] **Task #1: Side-by-Side Review & Restoration of Codex's Original Site Design vs. AG's Recent Redesign**
  - Compare Codex's original DOM & 6 stylesheets in `reference/codex-original/` (commit `555f369`) against Antigravity's dark-mode HUD redesign in `src/components/client/ClientWebsiteView.jsx`, `src/components/client/TiberiusHelperModal.jsx`, and `src/App.css` (commit `f2d9688`).
  - Restore Codex's original SCG Roofing visual design, warm editorial color tokens, typography, clean sticky `scrub.mp4` hero reveal (removing the unprompted 3D wireframe telemetry HUD overlay on top of the video by default), below-the-fold sections, and Alfred Roof Assistant modal styling while keeping multi-tenant React state hooks intact.
  - Stage the diff and run the Codex Astra 6 review gate (`REVIEW_NOTES.md`) to lock in the visual look before any further UI work.

## Milestone 2: Embedded Contextual AI Photo/SMS Dock (Token-Aligned)
- [x] **Task #2: Align Embedded Contextual AI Dock with Codex Design Tokens**
  - Style `src/components/client/ContextualAIDock.jsx` to match Codex's original surface, border, button, and typography tokens from `reference/codex-original/packages/site-components/styles.css` and `conversion-design.css`.
  - Verify `📷 Snap / Upload Photo` client-side `createImageBitmap` compression (`src/utils/photoOptimizer.js`), project question input, and mobile number SMS handshake into `PlatformContext.jsx`.

## Milestone 3: 3-Pane Unified Conversation Room & `[ 🤖 AI Autopilot | ✋ Take Over ]` Toggle
- [x] **Task #3: Harmonize 3-Pane Conversation Room UI with Codex Owner Inbox Aesthetic**
  - Align `ThreadQueue.jsx` (25%), `UnifiedTimeline.jsx` (50%), and `JobSummaryCard.jsx` (25%) with Codex's clean `reference/codex-original/packages/live-site/live.css` visual language while preserving the 3-pane layout.
  - Verify the `[ 🤖 AI Autopilot: ON | ✋ Take Over ]` header toggle, automatic human-reply Autopilot shutoff guardrail, Alfred draft approval card, Co-Pilot Whisper ("Suggest Reply" + Voice-Note-to-Polished-SMS), and click-to-enlarge photo lightbox.

## Milestone 4: TOS-Safe Conversational SMS Review Engine & Missed-Call Rescue
- [x] **Task #4: Verify & Polish Missed-Call Rescue & TOS-Safe SMS Review Engine**
  - Verify end-to-end simulation of Missed-Call Rescue and "Job Completed" conversational check-in in `WorkflowsLabView.jsx` and `PlatformContext.jsx` (unconditional Google Review link access + AI sentiment triage escalating negative replies to `🚨 Needs Human` and pausing AI Autopilot).
  - Run final Milestone Codex review gate, resolve all `REVIEW_NOTES.md` items, and log completion in `PROGRESS_LOG.md`.
