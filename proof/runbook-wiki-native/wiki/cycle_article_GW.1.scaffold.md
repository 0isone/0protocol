---
title: "GW.1.scaffold"
sources:
  - runbook/raw/cycle-receipts.ndjson#L13
related: []
tags:
  - cycle_article
created: 2026-04-17
updated: 2026-04-25
---

# GW.1.scaffold

**Timestamp:** 2026-04-17T05:00:17Z  
**Actor:** ?  

**Discovered Constraints:**
- Gateway runs in sandbox but forge.ext provisions via SSH — every scaffold action is one SSH round-trip; future GW.2/GW.3 file authoring will batch via heredocs to minimize round-trips.
- No sandbox PreToolUse hook to enforce authority.json — at this stage, authority is documented + self-disciplined, not mechanical. Future hardening = sandbox seed-gate equivalent.
- Lock target file (.locks/agent-vulcan.lock) is created with permissions 644 (non-secret); flock works on the inode regardless of contents.

**Evidence:**
- `/sandbox/vulcan.proto/gateway/authority.json`
- `/sandbox/vulcan.proto/gateway/README.md`
- `/sandbox/vulcan.proto/gateway/in/turn-intents.ndjson (empty)`
- `/sandbox/vulcan.proto/gateway/out/turn-results.ndjson (empty)`
- `/sandbox/vulcan.proto/gateway/state/queue.cursor (= 0)`
- `/sandbox/vulcan.proto/gateway/.locks/agent-vulcan.lock (empty, flock target)`

---
