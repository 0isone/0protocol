---
title: "3"
sources:
  - runbook/raw/cycle-receipts.ndjson#L11
related: []
tags:
  - cycle_article
created: 2026-04-12
updated: 2026-04-25
---

# 3

**Timestamp:** 2026-04-12T22:30:01Z  
**Actor:** ?  

**Discovered Constraints:**
- seed-gate.sh does not exempt plan files from cycle doc gate — plan write was blocked until progress.md updated; hook needs path pattern check for /sandbox/.claude/plans/** to honour seed.arch.plan_mode_as_native_cascade.001
- forge/in/function-proofs.ndjson had proof waiting since 2026-04-12T22:06:59Z; vulcan.forge only read it when explicitly tasked — inbound-read-first discipline addresses this gap going forward
- forge/out/progress.ndjson was empty for entire session history; forge.ext had no passive visibility into sandbox state between forge.direct calls — progress heartbeat addresses this

**Evidence:**
- `forge/in/function-proofs.ndjson:line1 (fp.forge-ext.2026-04-12.001)`
- `forge/out/results.ndjson:last (CouplingDecision coupled_valid)`
- `forge/out/progress.ndjson:line1 (first heartbeat)`

---
