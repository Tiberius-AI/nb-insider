# AGENTS.md — Quota-Aware AG / Codex Collaboration Protocol

```env
CODEX_TIER="plus"
# Flip CODEX_TIER="pro" later to unlock full parallel coding & multi-file implementation loops.
```

## 1. Quota & Role Split (Temporary Plus-Tier Mode for Codex)

- **Gemini 4 Argon (Ultra Tier - Primary Builder & Foreman):**
  - Has high token quota.
  - Handles **90% of active code generation**, file scaffolding, PowerShell execution, VPS SSH commands, and localhost browser verification.
  - Claims tasks from `TASK_QUEUE.md` as `[WIP: ARGON]`, implements changes locally, runs `npm run lint` and `npm run build`, and stages diffs for review.
- **Codex Astra 6 (Plus Tier - Senior Reviewer & Surgical Architect):**
  - Currently on tighter Plus rate limits (`CODEX_TIER="plus"`).
  - **DO NOT use Codex for bulk boilerplate or long autonomous loops.**
  - Only invoke Codex CLI at the end of a completed task/milestone to review the staged `git diff`, catch edge-case bugs, or critique UI/component structure.
  - Keep `CODEX_TIER="plus"` in effect until explicitly flipped to `"pro"` to unlock full parallel coding.

---

## 2. Strict Visual Guardrail (Do Not Redesign Without Approval)

- **No Unprompted Redesigns:** Never overwrite or "re-imagine" existing CSS, colors, typography, or layout structures unless a task explicitly says `[UI-REDESIGN]` or includes an explicit visual reference / DOM capture.
- **Canonical Visual Reference (`reference/codex-original/`):**
  - Codex's original UI components, typography, warm editorial palette (`#f6f1e8`, `#16181c`, `#b85a2b`, Fraunces + Plus Jakarta Sans), sticky video scrubbing stage (`packages/animation-engine/scroll-video.mjs`), 6 modular stylesheets (`packages/site-components/*.css`, `packages/live-site/live.css`), and owner inbox (`owner.html`, `packages/live-site/inbox.mjs`, `owner-handoff.mjs`) are archived at commit `555f369` in `reference/codex-original/`.
- **Design Token Alignment & Review Gate:**
  - When building or integrating new functional features (such as the **3-Pane Conversation Room**, **Embedded Contextual AI Dock**, or **TOS-Safe Conversational Review Engine**), match the existing Codex design tokens and have Codex review the component structure before finalizing.

---

## 3. Low-Token Review & Handoff Workflow

1. **Argon Builds & Stages:** Argon implements the active task from `TASK_QUEUE.md`, verifies `npm run lint` and `npm run build`, and runs `git add .`.
2. **Codex Surgical Review Gate (Max 1 call per milestone):**
   ```powershell
   codex exec "Read AGENTS.md. Review the staged git diff for bugs, regressions, or visual layout breaks. Output a concise bulleted pass/fail critique to REVIEW_NOTES.md without rewriting unrelated files."
   ```
   *(Fallback CLI path if `codex` is not yet refreshed in current shell PATH: `& "C:\Users\monet\AppData\Local\OpenAI\Codex\bin\896a0166b774037a\codex.exe" exec ...`)*
3. **Apply Fixes & Commit:** Argon reads `REVIEW_NOTES.md`, resolves any flagged regressions, commits with `feat(argon+astra): [task name]`, marks `[x]` in `TASK_QUEUE.md`, and logs a 3-line summary in `PROGRESS_LOG.md`.
