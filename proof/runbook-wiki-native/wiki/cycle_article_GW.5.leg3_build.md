---
title: "GW.5.leg3_build"
sources:
  - runbook/raw/cycle-receipts.ndjson#L25
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.5.leg3_build

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- witness-cycle's fallback (notify runbook's Claude via tmux) uses tmux send-keys, which runbook's authority answer classified as acceptable for NOTIFICATION but NOT for TRIGGER. This implementation respects the distinction: trigger is the truth-surface write detected by witness-tail; notification is supplementary (only used when no mechanical handler exists). Runbook should verify this distinction is preserved.
- HANDLERS registry is runbook-authored. forge.ext intentionally ships it empty because handler logic is runbook's authority (it encodes runbook's mechanical-witness criteria per cycle class). A handler populated by forge.ext would blur authority boundaries.
- witness-tail daemon ownership: currently spawnable via standard start/stop/status subcommands, but the PID file is under runbook/state/. A future refinement could integrate startup with runbook's tmux session lifecycle (e.g., runbook boot hook). Out of scope for this cycle.

**Evidence:**
- `/sandbox/vulcan.proto/runbook/bin/witness-tail.py (installed)`
- `/sandbox/vulcan.proto/runbook/bin/witness-cycle.py (installed)`
- `/sandbox/vulcan.proto/runbook/out/progress.ndjson (authority_answer @ 18:35:00Z)`
- `/sandbox/vulcan.proto/vulcan/out/gateway-leg-build-direction.2026-04-17T184000Z.md`

---
