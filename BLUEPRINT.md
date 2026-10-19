# PROJECT BLUEPRINT: Contractor AI Platform & Scrollytelling Engine

## 1. Core Business & Architecture Goal
We are building a proprietary, high-converting contractor web + AI lead-gen platform (replacing cookie-cutter GoHighLevel setups) with a **Rent ($297-$397/mo), Rent-to-Own ($497-$597/mo), or Buy Outright ($2,500+)** model, distributed and onboarded through **NB Insider**.

## 2. Pillar 1: The Higgsfield Scroll-Scrubbing Client Website Template
- **Visual Baseline & Guardrail:** Preserve Codex's original editorial SCG Roofing / Tiberius Smart Sites aesthetic (`reference/codex-original/` at commit `555f369`) as the canonical visual baseline. Do not overwrite its typography, warm light surface palette, or layout hierarchy with unprompted dark-mode HUD restyling.
- **Visual Engine:** Apple-style scroll-bound video scrubbing using HTML5 `<video>` / `<canvas>` + GSAP `ScrollTrigger` (`scrub: 0.4`, pinned hero section).
- **Video Pipeline:** Supports scrubbing the 24fps reveal video (`/assets/roofing/reveal-v3/scrub.mp4` + `poster.webp`) and loading a 150-frame `.webp` image sequence (extracted via FFmpeg from 5-second Higgsfield API camera orbits) with a procedural 3D wireframe fallback for testing.
- **Choreographed Callouts:** Floating glassmorphic value cards fade in/out at specific scroll percentages.
- **Embedded Contextual AI Dock (Replaces ignored corner chat bubbles):** Fixed glassmorphic bar at the bottom of the hero where homeowners can:
  1. Type a project question, OR
  2. Snap/upload a photo of their damage/project (`📷 Snap / Upload Photo`).
  3. Enter their mobile number to trigger an instant SMS handshake with our AI + Human back-office.
- **Multi-Tenant Config:** Driven by a single JSON config per contractor (`niche`, `brandColor`, `city`, `companyName`, `pricingRules`, `knowledgeBase`, `calcomConfig`).

## 3. Pillar 2: The GoHighLevel-Style 3-Pane Unified Conversation Room (Back-Office)
Emulate and upgrade the battle-tested 3-pane layout of GoHighLevel's Conversations tab, stripped of bloat, aligned with Codex's clean daylight design tokens, and powered by a **Grounded Knowledge Base** + **Dual-Mode Cal.com Calendar Engine**:
- **Left Pane (Thread Queue - 25%):** Contact list, search/filters (`All`, `Unread`, `AI Active`, `Booked`, `Needs Human`), channel badges (`SMS`, `Webchat`, `Missed Call`), Opportunity Pipeline Stage badge, and **AI Status Pills** (`🤖 AI Qualifying`, `🟢 Ready for Quote`, `📅 Cal.com Booked`, `🚨 Needs Human`).
- **Center Pane (Unified Timeline - 50%):** Chronological stream blending SMS, Webchat, Missed Call events, customer photos, audio voicemails, and **Knowledge Base Citations (`📚 KB Cited`)**.
  - **CRITICAL FEATURE:** Top header toggle: `[ 🤖 AI Autopilot: ON | 📝 Alfred Drafts | ✋ Take Over ]`. If a human types and sends a message, automatically flip Autopilot to OFF so AI and humans never talk over each other.
  - **Live Inbound Homeowner Simulator:** Test bar allowing the operator to send simulated homeowner SMS messages (pricing questions, warranty/ZIP checks, or *"Book me tomorrow at 9am"*) and watch Alfred query the Knowledge Base and book appointments on Cal.com in real time.
  - **Co-Pilot Whisper:** A "Suggest Reply" button that drafts a response grounded in the Knowledge Base & live Cal.com slots, plus Voice-Note-to-Polished-SMS for contractors in the field.
- **Right Pane (GHL Contact, Opportunity Pipeline, Cal.com Booking & Knowledge Base Card - 25%):**
  - Contact & Territory Verification + **GHL Opportunity Pipeline Stage** (`New Lead`, `AI Qualifying`, `Quote Sent`, `Appointment Booked`, `Job Won`)
  - Service Needed, Urgency & Estimated Job Value
  - Uploaded Customer Photos (with Vision AI pre-analysis summary & click-to-enlarge inspection lightbox)
  - **Dual-Mode Cal.com Calendar Engine:** Live slot picker, one-click or AI-autonomous booking (via Cal.com REST API + instant public handle/embed fallback), booking confirmation ID, reschedule/cancel actions, and live Cal.com embed modal.
  - **Tenant Knowledge Base Inspector:** View, search, and add live Knowledge Base articles/rules (`Service Territory`, `Pricing & Diagnostics`, `Warranty & Credentials`, `Emergency SOPs`) that immediately ground Alfred's responses.

## 4. Pillar 3: Automated SMS & Reputation Workflows
- **Missed-Call Rescue:** Instant conversational SMS trigger when a call is missed.
- **TOS-Safe Conversational Review Engine (No illegal star-gating):** A "Job Completed" trigger that texts the customer a natural check-in with the direct Google Review link included unconditionally, while AI sentiment analysis automatically escalates any issue reply to `🚨 Needs Human` and pauses AI Autopilot.

## 5. Multi-Trade Cloner & NB Insider Distribution Roadmap
- **Phase 1 (Milestone 5):** GoHighLevel-Style Conversation Room + Dual-Mode Cal.com Calendar Booking + Grounded Knowledge Base Engine.
- **Phase 2 (Milestone 6):** Rapid Multi-Trade Site Cloner — Master Electrician Template (Panel Upgrades, EV Chargers, Whole-Home Generators, 24/7 Emergency Dispatch) using the exact Codex site structure + custom scroll-scrubbing hero visual.
- **Phase 3 (Milestone 7):** NB Insider Flagship Website & Local Business Onboarding Portal to distribute the app and onboard local businesses.
