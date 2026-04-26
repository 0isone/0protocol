---
title: "session7.cycle3.vulcan-openclaw"
sources:
  - runbook/raw/cycle-receipts.ndjson#L5
related: []
tags:
  - cycle_article
created: 2026-04-11
updated: 2026-04-25
---

# session7.cycle3.vulcan-openclaw

**Timestamp:** 2026-04-11T01:15:00.000Z  
**Actor:** ?  

**Discovered Constraints:**
- witness.sh Check 1 only searched forge/projection-events.ndjson — receipts linking to runbook/vulcan projection events would always diverge. Fix: search all organ projection-events files.
- witness.sh Check 2 used hardcoded FORGE_DIR for bundle hash recomputation — must resolve source organ dynamically from projection event match.
- vulcan deploys at sandbox root (/sandbox/vulcan.proto/) not in a subdirectory — verify function must account for OpenClaw's flat workspace layout vs Claude Code's organ subdirectory pattern.

**Evidence:**
- `/Users/node.0/.0protocol/logs/forge.ext.progress.md`
- `/Users/node.0/.local/bin/forge.deploy`
- `/Users/node.0/.0protocol/scripts/sandbox/witness.sh`
- `/sandbox/vulcan.proto/runbook/proof-claims.ndjson`

---
