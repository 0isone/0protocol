---
title: "GW.4.smoke"
sources:
  - runbook/raw/cycle-receipts.ndjson#L17
related: []
tags:
  - cycle_article
created: 2026-04-25
updated: 2026-04-25
---

# GW.4.smoke

**Timestamp:** ?  
**Actor:** ?  

**Discovered Constraints:**
- Projection ordering is not strictly receipt-first: current daemon emits 'ended' projection BEFORE the CR append and before the 'receipt-appended' projection. The CR itself IS appended before 'receipt-appended' (that ordering is correct), but 'ended' fires earlier. Strict receipt-truth-before-projection would emit ALL projections for a turn only after the CR is committed to the truth surface. Defer fix to GW.5 or follow-up cycle; not blocking smoke validity since consumers keying on 'receipt-appended' for CR evidence see correct ordering.
- ECHO_ONLY: prefix gives a zero-cost full-chain exercise. echo_only_result mirrors the 12-field turn_result shape exactly so normalize_to_cr -> CR-append -> projection chain behaves identically whether invoke_adapter or echo_only_result produced the result. Reusable primitive for future smoke/regression cycles.
- Daemon is a long-lived service by design (queue-driven). Stop boundary at GW.4.smoke scopes further GW cycles by forge.ext; the daemon itself continues running awaiting vulcan's next intent (or an explicit 'gateway-bus.py stop' directive). Leaving it running preserves the wake-bus substrate for post-boundary operator review.

**Evidence:**
- `/sandbox/vulcan.proto/gateway/out/turn-results.ndjson#turn.GW.4.smoke.2026-04-17T16:38:32Z`
- `/sandbox/vulcan.proto/runbook/raw/cycle-receipts.ndjson#turn.GW.4.smoke.2026-04-17T16:38:32Z (daemon-emitted nested CR)`
- `/sandbox/vulcan.proto/.membrane/outbound.ndjson (4 projection events: accepted/started/ended/receipt-appended)`
- `cursor_advance: 0 -> 391`
- `daemon pid 32916 alive post-smoke`

---
