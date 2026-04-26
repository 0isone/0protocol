---
title: "forge-refactor.001.receipt-spine"
sources:
  - runbook/raw/cycle-receipts.ndjson#L30
related: []
tags:
  - cycle_article
created: 2026-04-18
updated: 2026-04-25
---

# forge-refactor.001.receipt-spine

**Timestamp:** 2026-04-18T17:45:31Z  
**Actor:** ?  

**Discovered Constraints:**
- forge/raw/ is a new Forge-internal surface parallel to runbook/raw/ — authority.json may need updating to include forge/raw/ in forge.vulcan allowed paths if hooks enforce path checking at the raw/ level

**Evidence:**
- `/sandbox/vulcan.proto/forge/raw/delegation-receipts.ndjson`
- `/sandbox/vulcan.proto/forge/raw/verification-receipts.ndjson`
- `/sandbox/vulcan.proto/forge/raw/reflection-receipts.ndjson`
- `/sandbox/vulcan.proto/forge/raw/closing-receipts.ndjson`
- `/sandbox/vulcan.proto/forge/architecture.md`
- `/sandbox/vulcan.proto/runbook/out/forge-refactor-cycle-001.md`

---
