# TASK_QUEUE.md — Autonomous Execution Queue (Argon + Astra)

> **Protocol:** Claim one task at a time as `[WIP: ARGON]`. Follow `AGENTS.md` and `.agents/agents/foreman.md`. Limit Codex review calls (`codex exec`) to 1 call per completed milestone and observe token pacing rules.

## Milestone 1: Visual Restoration & Side-by-Side Alignment (Codex Baseline vs. AG Redesign)
- [x] **Task #1: Side-by-Side Review & Restoration of Codex's Original Site Design vs. AG's Recent Redesign**

## Milestone 2: Embedded Contextual AI Photo/SMS Dock (Token-Aligned)
- [x] **Task #2: Align Embedded Contextual AI Dock with Codex Design Tokens**

## Milestone 3: 3-Pane Unified Conversation Room & `[ 🤖 AI Autopilot | ✋ Take Over ]` Toggle
- [x] **Task #3: Harmonize 3-Pane Conversation Room UI with Codex Owner Inbox Aesthetic**

## Milestone 4: TOS-Safe Conversational SMS Review Engine & Missed-Call Rescue
- [x] **Task #4: Verify & Polish Missed-Call Rescue & TOS-Safe SMS Review Engine**

---

## Milestone 5 (Phase 1): GoHighLevel-Style Conversation Room + Cal.com Calendar Booking + Knowledge Base Engine
- [x] **Task #5: Build Dual-Mode Cal.com Integration, Grounded Tenant Knowledge Base, & GHL Conversation Room Testing Suite**
  - Create `src/utils/calcomService.js` supporting both instant Cal.com handle/slug booking + live Cal.com API (`v1/slots` & `v1/bookings` via `VITE_CALCOM_API_KEY` or UI config drawer) and an interactive Cal.com live embed modal.
  - Create `src/utils/knowledgeBaseEngine.js` and enrich `src/config/contractors.json` with structured per-tenant Knowledge Base articles (`Territory & ZIPs`, `Pricing & Diagnostics`, `Warranties & Materials`, `Emergency & Scheduling SOPs`, plus custom owner-editable KB rules).
  - Upgrade the 3-Pane GoHighLevel-style Conversation Room (`ThreadQueue.jsx`, `UnifiedTimeline.jsx`, `JobSummaryCard.jsx`, `PlatformContext.jsx`) with:
    1. **Live Inbound Homeowner Reply Simulator** in the timeline so the owner can test customer questions and watch Alfred cite the Knowledge Base (`📚 KB Cited`) and autonomously book appointments onto Cal.com when a slot is requested.
    2. **GHL Opportunity Pipeline Stage Selector** (`New Lead`, `AI Qualifying`, `Quote Sent`, `Appointment Booked`, `Job Won`) and **Cal.com Appointment Manager** (slot selector, API/Embed status badge, reschedule/cancel, and live Cal.com modal).
    3. **Interactive Knowledge Base Manager & Cal.com Settings Drawer** so the owner can view/edit KB rules and connect their live Cal.com link/API key in real time.
  - Verify `npm run lint` and `npm run build`, run the Codex Astra 6 surgical review gate, and commit.

## Milestone 6 (Phase 2): Rapid Multi-Trade Site Cloner — Master Electrician Business Template
- [ ] **Task #6: Spin Up Challenging Trade Website (Master Electrician) Using Same Codex Structure**
  - Add a complete **Master Electrician** tenant (`VoltCraft Electrical & Panel — New Braunfels, TX`) with electrical-specific services (200A Panel Upgrades, Level 2 EV Charger Install, Whole-Home Backup Generators, Emergency Breaker/Fault Diagnostics), electrical Knowledge Base, and scroll-scrubbing hero visual.
  - Ensure 100% of `ClientWebsiteView.jsx`, `TiberiusHelperModal.jsx`, `ContextualAIDock.jsx`, and the GHL Conversation Room adapt seamlessly when switching between Roofing and Electrician tenants.

## Milestone 7 (Phase 3): NB Insider Distribution Website & Local Business Onboarding Portal
- [ ] **Task #7: Build NB Insider Flagship Distribution & Business Onboarding View**
  - Create the **NB Insider** platform showcase and interactive local business onboarding wizard (pick trade, customize brand/KB, connect Cal.com & Twilio SMS, and preview the generated Smart Site + GHL Conversation Room).
