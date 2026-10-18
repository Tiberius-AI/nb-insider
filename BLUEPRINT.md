# PROJECT BLUEPRINT: Contractor AI Platform & Scrollytelling Engine

## 1. Core Business & Architecture Goal
We are building a proprietary, high-converting contractor web + AI lead-gen platform (replacing cookie-cutter GoHighLevel setups) with a **Rent ($297-$397/mo), Rent-to-Own ($497-$597/mo), or Buy Outright ($2,500+)** model.

## 2. Pillar 1: The Higgsfield Scroll-Scrubbing Client Website Template
- **Visual Engine:** Apple-style scroll-bound video scrubbing using HTML5 `<canvas>` + GSAP `ScrollTrigger` (`scrub: 0.4`, pinned hero section).
- **Video Pipeline:** Supports loading a 150-frame `.webp` image sequence (extracted via FFmpeg from 5-second Higgsfield API camera orbits) with a procedural 3D wireframe fallback for testing.
- **Choreographed Callouts:** Floating glassmorphic value cards fade in/out at specific scroll percentages.
- **Embedded Contextual AI Dock (Replaces ignored corner chat bubbles):** Fixed glassmorphic bar at the bottom of the hero where homeowners can:
  1. Type a project question, OR
  2. Snap/upload a photo of their damage/project (`📷 Snap / Upload Photo`).
  3. Enter their mobile number to trigger an instant SMS handshake with our AI + Human back-office.
- **Multi-Tenant Config:** Driven by a single JSON config per contractor (`niche`, `brandColor`, `city`, `companyName`, `pricingRules`).

## 3. Pillar 2: The 3-Pane Unified Conversation Room (Back-Office)
Emulate the battle-tested 3-pane layout of GoHighLevel's Conversations tab, but stripped of bloat and upgraded with native AI + Human-in-the-loop controls:
- **Left Pane (Thread Queue - 25%):** Contact list, search/filters (Unread, AI Active, Needs Human), channel badges (SMS, Webchat, Missed Call), and **AI Status Pills** (`🤖 AI Qualifying`, `🟢 Ready for Quote`, `🚨 Needs Human`).
- **Center Pane (Unified Timeline - 50%):** Chronological stream blending SMS, Webchat, Missed Call events, customer photos, and audio voicemails.
  - **CRITICAL FEATURE:** Top header toggle: `[ 🤖 AI Autopilot: ON | ✋ Take Over ]`. If a human types and sends a message, automatically flip Autopilot to OFF so AI and humans never talk over each other.
  - **Co-Pilot Whisper:** A "Suggest Reply" button that drafts a response based on contractor rules, plus Voice-Note-to-Polished-SMS for contractors in the field.
- **Right Pane (Live AI Job Summary Card - 25%):** Contact details + an auto-populated LLM extraction card showing:
  - Service Needed & Urgency
  - Uploaded Customer Photos (with Vision AI pre-analysis summary)
  - Verified Zip/Address
  - Estimated Job Value & One-Click Calendar Booking

## 4. Pillar 3: Automated SMS & Reputation Workflows
- **Missed-Call Rescue:** Instant conversational SMS trigger when a call is missed.
- **TOS-Safe Conversational Review Engine (No illegal star-gating):** A "Job Completed" trigger that texts the customer a natural check-in ("How did everything go today?"). AI sentiment analysis routes positive replies to a direct Google Review link, and negative replies to `🚨 Needs Human` private escalation.
