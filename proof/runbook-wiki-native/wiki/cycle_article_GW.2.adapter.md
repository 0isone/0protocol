---
title: "GW.2.adapter"
sources:
  - runbook/raw/cycle-receipts.ndjson#L14
related: []
tags:
  - cycle_article
created: 2026-04-17
updated: 2026-04-25
---

# GW.2.adapter

**Timestamp:** 2026-04-17T13:40:09Z  
**Actor:** ?  

**Discovered Constraints:**
- sed-based single-quote escaping is UNSAFE for transferring Python source with triple-quoted docstrings — mangled line 93's '\n'.join(...) construct. FIX: use scp for source transfer, or use python stdin with base64 encoding. Going forward: scp for any multi-line Python source.
- Codex exec path NOT exercised at GW.2 — codex is expensive and side-effectful; exercising it here would exceed the cycle scope. GW.4.smoke uses echo-only turn to prove queue->adapter->CR pipe without codex; GW.5.e2e exercises codex for real.
- Adapter intentionally does NOT hold flock — caller (daemon) owns lock per design. Standalone CLI invocation therefore has no concurrency protection; that is acceptable for daemon-invoked path and operator-debug CLI.

**Evidence:**
- `/sandbox/vulcan.proto/gateway/bin/run-one-turn.py`
- `sha256:ffdab71b5dd193c493e0c4dbaaddec0c9a6881a0383bb9a4ab44d0eb22f0cfe8`
- `smoke test output captured in this CR execution_trace`

---
