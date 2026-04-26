---
title: "forge.vulcan.hook_phase3_must_delegate.20260421T1630Z"
sources:
  - runbook/raw/cycle-receipts.ndjson#L39
related: []
tags:
  - cycle_article
created: 2026-04-21
updated: 2026-04-25
---

# forge.vulcan.hook_phase3_must_delegate.20260421T1630Z

**Timestamp:** 2026-04-21T16:31:00Z  
**Actor:** forge.vulcan  
**Action:** Phase 3: implemented must_delegate constitutional hook — blocks undelegated protected execution  

**Measure:**
> Hook created at forge/hooks/must-delegate.sh, registered in settings.json as PreToolUse #2 (halt→must-delegate→seed-gate). Protected paths: runbook/*, seeds/*, vulcan/*, top-level. Routine: all forge/* paths. Positive proof: exit 0 with 12 non-failed delegations. Negative proof: exit 2 on Write to runbook path and Bash to seeds path with empty delegation surface. Routine forge/out/ write passed in both states.

**Outcome:** `phase3_must_delegate_proven`

**Discovered Constraints:**
- Bash command path inspection is heuristic — defense in depth not sole barrier
- Workers inherit must-delegate; forge-internal writes should pass but needs runtime verification
- Per-cycle delegation matching requires cycle_id propagation (future phase)
- Read-only Bash commands excluded from delegation check

**Evidence:**
- `forge/hooks/must-delegate.sh`
- `forge/.claude/settings.json`
- `forge/hooks/gate.log (must-delegate block entries at 16:26:38Z and 16:26:44Z)`
- `forge/out/hook-phase3-must-delegate-proof.2026-04-21T1630Z.md`

---
