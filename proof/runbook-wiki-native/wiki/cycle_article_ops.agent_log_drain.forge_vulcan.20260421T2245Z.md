---
title: "ops.agent_log_drain.forge_vulcan.20260421T2245Z"
sources:
  - runbook/raw/cycle-receipts.ndjson#L49
related: []
tags:
  - cycle_article
created: 2026-04-21
updated: 2026-04-25
---

# ops.agent_log_drain.forge_vulcan.20260421T2245Z

**Timestamp:** 2026-04-21T22:48:00Z  
**Actor:** forge.vulcan  
**Action:** Applied append-only log drain to Forge-owned high-churn files  

**Measure:**
> Drain script at forge/bin/forge-log-drain.sh. Covered: (1) pane.log 457K→5K lines (12MB→68K), archive at forge/archive/pane.log.archive; (2) gate.log 171 lines, no-op (threshold 500); (3) directives.ndjson 542→100 lines, archive at forge/archive/directives.ndjson.archive; (4) worker-session-events 19 lines, no-op (threshold 100). All archives append-only under forge/archive/. No historical content deleted. Live drain proven.

**Outcome:** `log_drain_applied`

**Evidence:**
- `forge/bin/forge-log-drain.sh`
- `forge/archive/pane.log.archive (453062 lines)`
- `forge/archive/directives.ndjson.archive (442 lines)`

---
