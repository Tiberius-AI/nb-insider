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