---
title: "GW.3.daemon"
sources:
  - runbook/raw/cycle-receipts.ndjson#L15
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.3.daemon

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- Daemon is NOT yet started — deploy means file-on-disk + AST-valid + status-callable. Starting the daemon is GW.4.smoke's precondition and will be executed ONLY under that cycle's scope.
- ECHO_ONLY: objective-prefix is a deterministic short-circuit path to exercise full queue -> lock -> results -> CR -> projection plumbing WITHOUT spending codex tokens; the smoke turn will use this path.
- invoke_adapter passes intent JSON via stdin to run-one-turn.py (via subprocess.Popen with stdin=PIPE, stdout=PIPE) — matches the _main_cli contract in run-one-turn.py.
- Receipt-truth-before-projection: CR fsync to /sandbox/vulcan.proto/runbook/raw/cycle-receipts.ndjson happens BEFORE the receipt-appended projection event is emitted to .membrane/outbound.ndjson.

**Evidence:**
- `local_sha=37b7166a42483d5333fbbc59cb6a681ee58312842228219b00dcdbf150ae0133`
- `sandbox_sha=37b7166a42483d5333fbbc59cb6a681ee58312842228219b00dcdbf150ae0133`
- `status_stdout='gateway-bus: not running
queue: 0 bytes
results: 0 bytes
cursor: 0'`

---
