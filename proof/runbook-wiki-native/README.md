# Runbook Wiki-Native Proof Bundle

This bundle makes the Runbook wiki-native productionization proof visible on GitHub.

## What Is Proven

- Runbook enablement `C1` through `C4` closed `coupled_valid`
- Feature `runbook_objective_led_orchestration_enablement` closed
- Wiki-native productionization `P1` closed `coupled_valid`
- The wiki corpus is now mechanically materialized from Runbook cycle receipts
- The wiki index and operations log were rebuilt from live Runbook-owned surfaces

## Visible Proof Surfaces

- `brief/productionization-brief.md`
  - Runbook-owned productionization brief that defines the live objective and the P1-P4 decomposition
- `materialize.py`
  - The materializer with the additive `--wiki-compat` adapter used for wiki-native output
- `wiki/`
  - The visible wiki corpus, including:
  - `wiki/index.md`
  - `wiki/log.md`
  - 59 materialized `cycle_article_*.md` files
  - legacy wiki articles preserved alongside the materialized corpus
- `proofs/fp.runbook.wiki_native.P1.mechanical.001.json`
  - Mechanical witness proving the P1 wiki-native materialization checks passed
- `coupling/coupling.runbook.wiki_native.P1.json`
  - Runbook coupling decision marking P1 `coupled_valid`
- `coupling/coupling.runbook.enablement.C4.integration.json`
  - Runbook coupling decision marking the enablement chain complete through C4
- `proofs/rfc.runbook.enablement.C1_C2_C3_C4.20260425T161000Z.json`
  - Feature-close receipt for the enablement chain

## Important Boundary

This proves the wiki-native capability is live at the Runbook corpus/index layer.

It does **not** claim that the host-side GitHub/CI activation track is complete. The productionization brief leaves those later steps explicit:

- P2: live loop on future `coupled_valid` cycles
- P3: index-node graph coupling
- P4: host-side repo and CI activation

## Why This Branch Exists

The local sandbox/workspace history is not the same as the public `origin/main` history. This branch packages the Runbook proof bundle cleanly on top of the public repository history so the wiki corpus, index, and witness records are inspectable on GitHub.
