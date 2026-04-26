---
title: "GW.5.e2e"
sources:
  - runbook/raw/cycle-receipts.ndjson#L21
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.5.e2e

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- GW.2.adapter contract had TWO silent codex-invocation defects: (a) --approval-mode flag not valid in codex 0.117.0 CLI; (b) --skip-git-repo-check required for non-git workspaces. GW.3 mechanical witness passed because ECHO_ONLY never invokes codex. Mechanical witness for adapter contracts MUST include a token-costing codex dry-run, not only a shape/parse check.
- Circuit leg 1 (Vulcan-demand -> gateway-intent) is currently mediated by forge.ext as an agent, not by a mechanical tail. Vulcan's demand arrives as a directive (meta-instruction: 'do GW.5'), not as a TurnIntent. forge.ext interprets directive -> constructs TurnIntent -> enqueues. Under strict no-manual-relay this is still behavioral relay, just automated behavioral rather than human.
- Circuit leg 3 (runbook receipt -> runbook FPR/FP/coupling) did NOT auto-fire within 10 min for the successful retry2 CR. Runbook's authoritative witness loop is not currently triggered by new-line-on-cycle-receipts.ndjson. Without a runbook-side tail or explicit poke, CRs pile up without closure.
- Two legs of the circuit require infrastructure beyond GW.5's scope: a Vulcan-demand tail that converts directives to TurnIntents (for leg 1), and a runbook-side tail that auto-witnesses new CRs (for leg 3). GW.6.adopt depends on both.

**Evidence:**
- `/sandbox/vulcan.proto/gateway/out/turn-results.ndjson#turn.GW.5.e2e.retry2.2026-04-17T17:22:36Z`
- `/sandbox/vulcan.proto/runbook/raw/cycle-receipts.ndjson#turn.GW.5.e2e.retry2.2026-04-17T17:22:36Z (CR landed, awaiting witness)`
- `runbook escalation artifact 7b1c281c6ad15593 via forge.ext ingress-ledger 17:23:37Z`
- `runbook coupling-decisions.ndjson last entry: coupling.GW.4.smoke @ 2026-04-17T16:43:00Z (no GW.5 entry yet)`

---
