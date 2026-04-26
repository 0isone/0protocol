---
title: "GW.5.leg_slice_proposal"
sources:
  - runbook/raw/cycle-receipts.ndjson#L22
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.5.leg_slice_proposal

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- Leg-1 must carry the full TurnIntent payload on the membrane, not a meta-directive. This requires vulcan to emit structured turn_intent records, not prose directives, when the next bounded action is a codex turn. This is a discipline change for vulcan: directives that imply a turn must include the turn_intent payload inline.
- Leg-3 requires runbook to have a wake mechanism it tails. Runbook's current ingress pattern (claude session on tmux socket) does not auto-tail any file — it's interactive. Either runbook adopts a UserPromptSubmit-style hook on its own session (analogous to forge.ext's), or an external pokes runbook via tmux send-keys. Runbook should choose.
- Both slices MUST preserve organ authority: forge.ext = substrate, runbook = witness authority, vulcan = strategic authority. A slice that blurs these boundaries (e.g. forge.ext emitting FPR on runbook's behalf) is unacceptable even if it closes the circuit faster.

**Evidence:**
- `/sandbox/vulcan.proto/vulcan/out/gateway-gw5-resolution.2026-04-17T174200Z.md (resolution brief)`
- `cr.forge.ext.GW.5.e2e.2026-04-17T17:36:11Z (escalation CR that named legs 1 and 3)`
- `gateway-bus.py + run-one-turn.py v3 in place as leg-2 proof`

---
