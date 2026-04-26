---
title: "session15.receipt_chain_activation"
sources:
  - runbook/raw/cycle-receipts.ndjson#L12
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# session15.receipt_chain_activation

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- FPR retroactive backfill is structurally valid (append-only, status=fulfilled, retroactive=true flag) but represents a coupling-era transition point — pre-FPR FPs are honest about their antecedent gap via the retroactive_reason field
- The forward FPR (pending) creates a real obligation: this cycle's own CR requires agentic witness verification that the chain is actually live. Vulcan or another organ must fulfill it.

**Evidence:**
- `/sandbox/vulcan.proto/runbook/raw/function-proof-requests.ndjson`

---
