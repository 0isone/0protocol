---
title: "2"
sources:
  - runbook/raw/cycle-receipts.ndjson#L10
related: []
tags:
  - cycle_article
created: 2026-04-12
updated: 2026-04-25
---

# 2

**Timestamp:** 2026-04-12T00:01:00Z  
**Actor:** ?  

**Discovered Constraints:**
- function-proof-requests.ndjson does not yet exist in runbook/raw/ — FPR is deposited to forge/out/results.ndjson as the established output channel until the surface is formally created
- forge/in/function-proofs.ndjson currently contains prior forge.direct response echoes — forge.ext will need to append a new FunctionProof entry in response to this FPR

**Evidence:**
- `forge/in/function-proofs.ndjson:last-3-lines (three forge.direct call responses)`
- `forge/out/results.ndjson (established output channel)`
- `conversation: string memorize turn + recall turn`

---
