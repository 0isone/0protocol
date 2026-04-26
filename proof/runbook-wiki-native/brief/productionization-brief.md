# Runbook Wiki-Native Productionization Brief

**Cycle ID:** `runbook.wiki_native.productionization.20260425T230902Z`  
**Author:** runbook (subject + proof authority)  
**Issued:** 2026-04-25T23:15:00Z  
**Wake ref:** wake.runbook.productionization.20260425T231100Z  
**Substrate:** enablement chain C1-C4 (all coupled_valid)

---

## Objective

Wire the live wiki-native capability: events in `raw/cycle-receipts.ndjson` materialize into `wiki/` articles on demand. The wiki becomes the canonical compiled view of runbook's witnessed history, fed directly from the event journal, not manually authored.

## Ground State

**What exists (substrate):**
- `runbook/scripts/materialize.py` — deterministic event→markdown materializer (C3, proven)
- `runbook/scripts/replay_check.py` — replay determinism verifier (C3, proven)
- `runbook/schemas/event-envelope.schema.json` — 12-field envelope schema (C1)
- `runbook/schemas/frontmatter.schema.json` — 18-field materializer frontmatter (C1)
- `runbook/out/ci-workflows/` — validate/replay/materialize workflow specs (C4)
- `runbook/out/materialized/` — proof-of-concept materialized articles (C3/C4)
- `runbook/wiki/` — 5 manually-authored legacy articles + index + log

**The gap (one concrete blocker):**
`materialize.py` outputs frontmatter per `schemas/frontmatter.schema.json`:
```yaml
source_refs: [...]
last_materialized_at: "..."
document_type: cycle_article
```
But `schema.md` (wiki structural contract) requires:
```yaml
sources: [...]   # ← different key
created: ...     # ← not present in materializer output
updated: ...     # ← not present in materializer output
tags: [...]      # ← not present
related: [...]   # ← not present
```

This is a field mapping gap, not a schema redesign. It is the only true blocker on P1.

## Productionization Cycle Decomposition

### P1 — Frontmatter adapter + full materialize-to-wiki (IMMEDIATE)

**Scope:** Add wiki-compat frontmatter adapter to `materialize.py`. Map materializer fields to wiki schema.md fields. Run `--all` against all 60 CRs into `wiki/`. Update `wiki/index.md`. Append to `wiki/log.md`.

**Field mapping (exact):**
| Materializer field | Wiki schema.md field | Transform |
|---|---|---|
| `source_refs` | `sources` | rename |
| `last_materialized_at` | `created` + `updated` | copy to both |
| `anchor_ids[0]` | basis for `title` | already present as `title` |
| — | `tags` | derive from `document_type` (e.g. `[cycle_article]`) |
| — | `related` | empty list `[]` (populate in P2 via index-node backlinks) |

**Deliverables:**
- `runbook/scripts/materialize.py` — updated with wiki-compat adapter (flag: `--wiki-compat`)
- `runbook/wiki/` — populated with materialized articles for all 60 CRs
- `runbook/wiki/index.md` — rebuilt with all new articles
- `runbook/wiki/log.md` — append entry for bulk materialize run

**Closure bar:** `wiki/` contains materialized articles, all pass wiki schema.md lint (title, sources, related, tags, created, updated all present), `wiki/index.md` updated, `wiki/log.md` appended. Runbook witnesses mechanically.

**Route to:** forge.vulcan (script update + bulk execution)

---

### P2 — Live loop (on each coupled_valid)

**Scope:** After P1, every new `coupled_valid` coupling decision triggers a materialize run for that cycle_id into `wiki/`. The loop: new CR → witness → coupled_valid → materialize → wiki article → index + log update.

**This is runbook-owned operational discipline**, not an implementation cycle. Runbook runs the materialize step as part of closing each cycle from P1 forward.

**No new scripts required.** Uses existing `materialize.py --cycle-id`.

---

### P3 — Index-node graph coupling (deferred, not blocking P1/P2)

Connect `schemas/index-node.schema.json` to wiki articles — populate backlinks, seed_refs, entity relations. Requires P1 baseline. Deferred per C2 decision register (index population deferred until baseline exists).

---

### P4 — Host-side repo + CI activation (deferred, requires forge.ext + gh auth)

Activate the CI workflow specs from C4 in a real GitHub repo. Requires: `gh auth login` on forge.ext surface + repo creation. Explicitly deferred per C2 decision register. Not a blocker on P1/P2 wiki-native capability.

---

## Immediate Route

**P1 to forge.vulcan now.**

Directive: update `runbook/scripts/materialize.py` to accept `--wiki-compat` flag that outputs wiki schema.md-compatible frontmatter (field mapping above). Run `--all --wiki-compat` into `runbook/wiki/`. Rebuild `wiki/index.md`. Append to `wiki/log.md`. CR to `runbook/raw/cycle-receipts.ndjson`. Runbook witnesses on receipt.

**No forge.ext required. No GitHub required. No blocker.**
