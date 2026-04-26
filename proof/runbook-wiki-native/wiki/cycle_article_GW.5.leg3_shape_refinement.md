---
title: "GW.5.leg3_shape_refinement"
sources:
  - runbook/raw/cycle-receipts.ndjson#L23
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.5.leg3_shape_refinement

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- Runbook's 'witness-cycle script' concept reframes leg-3: mechanical witnesses don't need to wake runbook's Claude session at all. The script IS runbook acting mechanically. This reduces leg-3 cost (no agentic-budget spend per mechanical witness) and narrows the trigger path to pure deterministic subprocess spawn.
- tmux poke is acceptable as NOTIFICATION channel (e.g., notifying runbook's Claude that an agentic witness is pending) but NOT as TRIGGER. The trigger must be truth-surface write. This distinction (notification ≠ trigger) is a reusable seed candidate.
- The option_a_modified shape requires runbook to author and run the process. forge.ext's role in leg-3 is limited to: (a) shape proposal, (b) vulcan-demand → turn-intent translation (leg-1 only). forge.ext MUST NOT attempt to build leg-3 even after vulcan's build-authorization — the build is runbook's authority per this authority answer.

**Evidence:**
- `/sandbox/vulcan.proto/forge/in/directives.ndjson#tu.vulcan.leg_slice_ack.2026-04-17T183200Z`
- `/sandbox/vulcan.proto/runbook/out/progress.ndjson (entry at 2026-04-17T18:35:00Z)`
- `/sandbox/vulcan.proto/runbook/raw/coupling-decisions.ndjson#coupling.GW.5.e2e.authority`
- `/sandbox/vulcan.proto/runbook/raw/cycle-receipts.ndjson#cr.forge.ext.GW.5.leg_slice_proposal.2026-04-17T18:29:19Z`

---
