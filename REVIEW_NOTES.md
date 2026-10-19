# REVIEW_NOTES.md — Codex Astra 6 Surgical Review Gate

## Milestone 1 / Task #1 Review (Codex Original Site Design Restoration)

### Original Codex Astra 6 Critique (`codex exec - -s read-only -o REVIEW_NOTES.md`)
- **P1 — Quote data lost** (`TiberiusHelperModal.jsx:263`): submission omits email and sends `zip` instead of `zipCode`. Service, property, roof-age, and contact-window fields also fall back to defaults. Restore the `submitHeroLead` payload contract.
- **P2 — Uploaded animation frames ignored** (`ClientWebsiteView.jsx:155`): renderer receives one image but expects an array. A focused probe reproduced the unintended wireframe fallback.
- **P2 — Mobile controls overlap** (`App.css:2346`): motion controls remain at `bottom:112px` while the dock expands into three rows below 980px, covering them. Reserve responsive space.
- **P2 — Subsequent quotes blocked** (`TiberiusHelperModal.jsx:70`): after submission, `reviewState` stays `saved`; reopening “Get a quote” never resets the wizard.
- **P2 — Tenant services replaced** (`ClientWebsiteView.jsx:571`, `TiberiusHelperModal.jsx:517`): hardcoded SCG roofing services replace tenant-driven content, including for HVAC and decking tenants.
- **PASS:** Lint and staged whitespace checks pass; all six copied stylesheets exactly match the archive.

### Resolution Status (Argon Applied & Verified)
- [x] **P1 Fixed (`TiberiusHelperModal.jsx`):** Restored full `submitHeroLead` payload contract (`email`, `zipCode`, `serviceName`, `propertyType`, `roofAge`, `preferredWindow`, `sourceLabel`) in both `sendChatReply` and `handleSaveLead`.
- [x] **P2 Fixed (`ClientWebsiteView.jsx`):** Passed `customFramesRef.current` (the full array) to `renderScrubFrame` instead of a single element so custom uploaded frame sequences render properly.
- [x] **P2 Fixed (`src/App.css`):** Added responsive rules at `@media (max-width: 980px)` (`bottom: 148px !important` + 2-row dock) and `@media (max-width: 640px)` (`bottom: 122px !important` + compact dock) so `.hero-bottom` and `.contextual-ai-dock-wrapper` never overlap, plus added `.helper-close-btn`.
- [x] **P2 Fixed (`TiberiusHelperModal.jsx`):** Reset `reviewState` to `'form'` and `step` to `0` when reopening quote mode (`goMode`), clicking `Start another request`, or closing the modal via `handleCloseModal`.
- [x] **P2 Fixed (`ClientWebsiteView.jsx` & `TiberiusHelperModal.jsx`):** Preserved SCG's exact Codex copy when `activeTenant.id === 'scg-roofing'` while dynamically rendering `activeTenant.pricingRules.services`, `activeTenant.projects`, and `activeTenant.faqs` for non-SCG tenants (`Apex Roofing`, `Precision HVAC`, `Vanguard Decks`).

---

## Final Milestone 4 / Task #2–#4 Review (Contextual AI Dock, 3-Pane Conversation Room, & Review Engine)

### Original Codex Astra 6 Critique (`codex exec - -s read-only -o REVIEW_NOTES_FINAL.md`)
- **P2 — Empty draft approval sends unintended text** (`src/components/backoffice/UnifiedTimeline.jsx:457`, `src/context/PlatformContext.jsx:407`): Clearing the draft textarea and clicking “Approve & Send to Homeowner” resends the original draft (`"" || thread.alfredDraft.text`), while whitespace-only input (`"   "`) sends a blank message (`""`). Reject empty/whitespace drafts and disable the approve button when trimmed text is empty.
- **P2 — Leak complaints route as positive** (`src/context/PlatformContext.jsx:706`): Replacing `'leak'` with `'leaking'` causes replies like `"The roof still leaks"` to be classified as positive. Handle `"leak"` / `"leaks"` while distinguishing resolved-leak praise (`"fixed the flashing leak"`).
- **P2 — Three-photo preview overflows narrow screens** (`src/App.css:529`): `.selected-photo-preview` and `.dock-thumb-stack` do not wrap, overflowing mobile screens when 3 thumbnails are attached. Allow the preview row and thumbnail stack to wrap or scale down at mobile breakpoints.
- **Task #4 Blocker — Selective review link gating** (`src/context/PlatformContext.jsx:680,760,786`, `src/components/workflows/WorkflowsLabView.jsx:180–281`): Sending `activeTenant.googleReviewUrl` only when `!isNegative` conflicts with Google's prohibition on selectively soliciting reviews only from positive respondents. Include the Google review invitation unconditionally while keeping AI sentiment triage to escalate negative replies to `🚨 Needs Human` and pause AI Autopilot.
- **PASS:** Guardrails (`AGENTS.md`) respected; all six archived stylesheets in `public/packages/**` remain untouched and match `reference/codex-original/`; warm editorial and daylight inbox design tokens align with Codex's original stylesheets.

### Resolution Status (Argon Applied & Verified)
- [x] **P2 Fixed (`PlatformContext.jsx` & `UnifiedTimeline.jsx`):** Updated `approveAlfredDraft` to inspect `customText !== undefined ? customText : targetThread.alfredDraft.text`, trim, and return early if empty; disabled the `Approve & Send to Homeowner` button in `UnifiedTimeline.jsx` whenever `!activeDraftText.trim()`.
- [x] **P2 Fixed (`PlatformContext.jsx`):** Restored `'leak'` to `negativeKeywords` after stripping resolved-leak praise (`/\b(?:fixed|repaired|stopped|solved|sealed)\s+(?:the\s+|our\s+|my\s+|a\s+)?(?:\w+\s+)?leaks?\b/g`), so `"The roof still leaks"` routes as negative (`🚨 Needs Human`) while `"Crew fixed the flashing leak"` routes as positive.
- [x] **P2 Fixed (`src/App.css`):** Added `flex-wrap: wrap` to `.selected-photo-preview` and `.dock-thumb-stack`, `min-width: 0; flex: 1 1 180px` to `.dock-photo-meta`, and mobile thumbnail sizing (`60px x 44px`) at `@media (max-width: 640px)`.
- [x] **Task #4 Compliance Fixed (`PlatformContext.jsx` & `WorkflowsLabView.jsx`):** Included `activeTenant.googleReviewUrl` unconditionally in the initial post-job check-in SMS (`triggerJobCompletedCheckIn`) and kept it open in both branches of `simulateCustomerReviewReply`, while negative sentiment replies still immediately flip the thread to `🚨 Needs Human`, pause AI Autopilot, and alert the owner.