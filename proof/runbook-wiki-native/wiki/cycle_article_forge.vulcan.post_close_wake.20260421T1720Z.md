---
title: "forge.vulcan.post_close_wake.20260421T1720Z"
sources:
  - runbook/raw/cycle-receipts.ndjson#L45
related: []
tags:
  - cycle_article
created: 2026-04-21
updated: 2026-04-25
---

# forge.vulcan.post_close_wake.20260421T1720Z

**Timestamp:** 2026-04-21T17:21:00Z  
**Actor:** forge.vulcan  
**Action:** Implemented post-close-wake PostToolUse hook — mechanically wakes all peer agents after cycle closure  

**Measure:**
> Hook detects closing-receipts.ndjson writes, sends 3 wakes: Runbook (tmux send-keys+Enter), Vulcan (vulcan/in/directives.ndjson file write), forge.ext (wake-forge-ext CLI). Test: 3/3 sent, 0 failures. Wake log tracks events. Closes silent-stall gap where missing convention-based notification caused cycles to stall.

**Outcome:** `post_close_wake_proven`

**Discovered Constraints:**
- PostToolUse wakes are best-effort (exit codes ignored) — correct for side-effects
- Each agent uses its canonical comm channel
- Individual wake failures non-cascading

**Evidence:**
- `forge/hooks/post-close-wake.sh`
- `forge/.claude/settings.json`
- `forge/hooks/wake.log`
- `forge/out/post-close-wake-proof.2026-04-21T1720Z.md`

---
