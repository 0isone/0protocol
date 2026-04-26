---
title: "runbook.enablement.C3.materializer_replay.20260424T0243Z"
sources:
  - runbook/raw/cycle-receipts.ndjson#L59
related: []
tags:
  - cycle_article
created: 2026-04-24
updated: 2026-04-25
---

# runbook.enablement.C3.materializer_replay.20260424T0243Z

**Timestamp:** 2026-04-24T02:52:00Z  
**Actor:** forge.vulcan  
**Action:** C3 Materializer + Replay: created materialize.py and replay_check.py, proved deterministic materialization of one CR  

**Measure:**
> materialize.py reads pre-envelope cycle-receipts.ndjson, groups by cycle_id, renders canonical markdown with C1 frontmatter schema. replay_check.py full-replays from scratch and compares with existing. One-aggregate proof: M1.base_confirmation.20260421T2100Z materialized → sha256 ca4e5c2cfdf0ec46d31bbde136f55c1e8e0564d0944a6aada74a954ae6f759fb. Replay check: 1 match, 0 mismatches (55 missing = unmaterialized cycles, expected). Determinism confirmed: same input + same ts-override → identical output.

**Outcome:** `C3_materializer_replay_complete`

**Discovered Constraints:**
- cycle_id field is sometimes integer (old entries) — slugify and sort must handle mixed types
- Deterministic output requires ts-override for last_materialized_at — without override, each run produces different timestamp
- replay_check reports 'missing' for unmaterialized cycles — this is expected, not an error. True mismatches are 0.
- Pre-envelope entries map cleanly with field correspondence from C1 — no data loss

**Evidence:**
- `runbook/scripts/materialize.py`
- `runbook/scripts/replay_check.py`
- `runbook/out/materialized/cycle_article_M1.base_confirmation.20260421T2100Z.md (sha256:ca4e5c2c...)`

---
