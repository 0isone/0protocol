---
title: "session6.cycle1.projection-v3.forge"
sources:
  - runbook/raw/cycle-receipts.ndjson#L2
related: []
tags:
  - cycle_article
created: 2026-04-10
updated: 2026-04-25
---

# session6.cycle1.projection-v3.forge

**Timestamp:** 2026-04-10T14:00:51Z  
**Actor:** forge.ext-session6  
**Action:** Cycle 1 of projection-system v3 refactor: build first deterministic Forge projection under v3 framework, deploy to /sandbox/vulcan.proto/forge/, mark cycle-2 witness gap structurally with witness_status pending_cycle2  

**Measure:**
> 9 of 13 verification tests passed mechanically (1-8, 13); 3 smoke tests (9-11) deferred to first sandbox boot; test 12 is this receipt itself. Legacy forge.deploy verify all 15/15 still passes (zero regression). New forge.deploy verify v3 10/10 passes. Bundle hash a6dd5b03... reproduces deterministically. Pre-cycle-1 snapshot at /sandbox/vulcan.proto/forge.previous.cycle1-pre/. Rollback rehearsal confirms safe failure.

**Outcome:** `pass`

**Discovered Constraints:**
- Cross-platform sort determinism: find|sort is locale-dependent on macOS; bundle_hash on a different host would differ for the same inputs. Promote as portable-determinism rule.
- Cwd-safety in scripts that rm -rf: scripts that delete paths which could be a parent process cwd should idempotency-check or cd to safe location first. Promote as operational discipline.
- Schema-version field convention: extending in place requires optional fields + schema_version sibling + type union widening. Promote as versioning convention.
- Sandbox tool availability: SSH commands must use only sandbox-available tools (no jq; use node). Already documented in CLAUDE.md, skip promotion.

**Evidence:**
- `/Users/node.0/.0protocol/verification/cycle1.projection-v3.forge.md`
- `/sandbox/vulcan.proto/forge/projection-events.ndjson`
- `/sandbox/vulcan.proto/forge/manifest.json`
- `/Users/node.0/.0protocol/logs/forge.ext.progress.md`

---
