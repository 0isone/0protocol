---
title: "session6.cycle2.runbook-as-witness"
sources:
  - runbook/raw/cycle-receipts.ndjson#L4
related: []
tags:
  - cycle_article
created: 2026-04-10
updated: 2026-04-25
---

# session6.cycle2.runbook-as-witness

**Timestamp:** 2026-04-10T15:42:48Z  
**Actor:** forge.ext-session6  
**Action:** Cycle 2 of projection-system v3 refactor: build runbook as the external witness for forge. Authored runbook body+frame under v3, generalized forge.project.v3 to handle both organs (ORGAN_CONFIG + LC_ALL=C sort fix), deployed runbook bundle (scripts/witness.sh + scripts/compile-wiki.sh + 3 skills + 3 schemas), re-deployed forge (sort fix), ran witness against cycle 1 pending receipt producing first proof claim (result=pass), refactored forge.ingest-runbook to close three-layer-stack violation (fu.session5.cycle9.004). 38/38 mechanical checks pass. 7/7 wiki lint pass.  

**Measure:**
> 38/38 mechanical verification (15 legacy + 10 v3 forge + 13 v3 runbook). Witness end-to-end test: synthetic test receipt witnessed with result=pass, coverage=3/3, idempotency verified, status query works. Runbook ingest refactor: compile-wiki.sh compiles articles on sandbox under runbook authority. forge.lint-runbook 7/7 PASS (2 WARN for seed hash drift = informational).

**Outcome:** `pass`

**Discovered Constraints:**
- Sandbox HOME=/sandbox causes tilde expansion in case patterns to match all sandbox paths: ~/* expands to /sandbox/*. Fix: never use ~/* in sandbox-side case patterns; use absolute host prefixes only (/Users/*, /home/node.0/*).
- Lint head-30 truncation: the existing forge.lint-runbook used head -30 to extract frontmatter fields, which fails for articles with long seed_references lists. Fix: extract frontmatter between --- delimiters via awk instead of head.
- Evidence_refs in cycle receipts may contain host paths unreachable from sandbox witness. The witness must skip unreachable paths rather than flagging them as broken.
- Bash command substitution inside node -e strings expands shell variables before node runs; multiline variables cause too many arguments errors in shell tests. Fix: pre-compute string values in shell, then embed as literals.

**Evidence:**
- `/sandbox/vulcan.proto/runbook/projection-events.ndjson`
- `/sandbox/vulcan.proto/runbook/proof-claims.ndjson`
- `/sandbox/vulcan.proto/runbook/manifest.json`
- `/sandbox/vulcan.proto/forge/projection-events.ndjson`
- `/sandbox/vulcan.proto/forge/manifest.json`

---
