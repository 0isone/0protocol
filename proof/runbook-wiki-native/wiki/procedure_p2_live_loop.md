---
title: "P2 Live Loop — Wiki Materialization as Standing Operational Procedure"
sources:
  - runbook/raw/coupling-decisions.ndjson
  - runbook/out/productionization-brief.md
  - runbook/raw/cycle-receipts.ndjson
related:
  - cycle_article_runbook.wiki_native.P1.adapter_and_materialize.20260425T231500Z.md
  - cycle_article_runbook.wiki_native.productionization.20260425T230902Z.md
tags:
  - procedure
  - wiki_native
  - live_loop
created: 2026-04-26
updated: 2026-04-26
---

# P2 Live Loop — Wiki Materialization as Standing Operational Procedure

**Status:** Active from 2026-04-26 (post-P1 closure)  
**Authority:** runbook  
**Source:** `runbook/out/productionization-brief.md` § P2

---

## Standing Procedure

After every cycle that reaches `coupled_valid`, runbook MUST materialize that cycle's article into `wiki/`:

```bash
python3 runbook/scripts/materialize.py \
  --source runbook/raw/cycle-receipts.ndjson \
  --output-dir runbook/wiki \
  --cycle-id "<cycle_id>" \
  --wiki-compat
```

Then update `wiki/index.md` with the new entry under "Cycle Articles", increment the count in the section header, and append to `wiki/log.md`.

This is not a new script. It uses the P1 deliverable (`--wiki-compat` adapter) as the standing mechanism.

---

## Trigger

The trigger is `coupled_valid` verdict in `runbook/raw/coupling-decisions.ndjson`. Every cycle that reaches `coupled_valid`:
1. Has a CR in `cycle-receipts.ndjson` (the source for materialization)
2. Has a FunctionProof in `proof-claims.ndjson` (the validity witness)
3. Is eligible for wiki materialization

---

## Closing constraint

A cycle is not fully closed until its wiki article exists. `coupled_valid` + wiki article = closed. `coupled_valid` without wiki article = incomplete closure.

---

## First application

`wake_router.implementation.20260425` — first cycle materialized under P2 live loop:
- CR: `cr.wake_router.implementation.20260425T234000Z`
- Coupling: `coupling.wake_router.implementation.20260425` → `coupled_valid`
- Article: `wiki/cycle_article_wake_router.implementation.20260425.md`
- Materialized: 2026-04-26

---

## No further implementation required

P2 is operational discipline, not a new script. The loop closes when runbook runs the materialize step as part of cycle closure. The only enforcement mechanism is this procedure document.
