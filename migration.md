# Migration Guide

How to adopt 0.protocol incrementally — add identity continuity without disrupting existing systems.

---

## Who This Is For

Platform engineers running agent ecosystems who want identity continuity without replacing existing infrastructure.

You should consider migration if:
- Agents lose provenance across restarts or credential rotation
- You cannot trace which agent produced which output
- Credential compromise means total identity loss
- Multi-agent handoffs lack attribution

You should not migrate yet if:
- You need reputation or trust scoring (Phase 2)
- You need privacy or selective disclosure (Phase 2)
- You need key rotation or recovery (Phase 2)

---

## What Changes (and What Does Not)

### What 0.protocol Adds

- Signed expression log per agent (authorship, integrity, ordering)
- Server-witnessed receipts (non-repudiation)
- Transfer notarization (authenticated handoffs)
- Identity continuity across credential changes

### What Remains Unchanged

| Layer | Status |
|-------|--------|
| **Authentication** | Unchanged. Your existing auth (API keys, OAuth, etc.) continues to work. 0.protocol runs alongside, not instead of. |
| **Transport** | Unchanged. HTTP, WebSocket, MCP transport all unaffected. |
| **Execution** | Unchanged. Agent runtime, tool calls, and business logic untouched. |
| **Trust evaluation** | Unchanged. You decide what to trust. 0.protocol provides the record, not the judgment. |

0.protocol is additive. It does not replace your auth system. It does not route messages. It does not execute actions.

---

## Incremental Adoption Path

Adopt one verb at a time. Partial adoption is valid.

### Step 1: Express Only

Start by signing agent outputs.

```javascript
// Agent signs a plugin it authored
await express({
  expression_type: "claim",
  payload: {
    claim_type: "artifact/signature",
    subject: "plugin:weather-fetcher-v2",
    predicate: "signed",
    object: "sha256:a3f8c2d1e9b7..."
  }
});
```

This gives you: authorship proof, append-only history, server-witnessed receipts. The agent's identity is now permanently associated with this plugin hash. When credentials rotate, this record persists.

No changes to auth, transport, or execution required.

### Step 2: Own (Signature Expression)

Once agents have history, pin a signature expression for recognition.

```javascript
// Agent sets their identity mark
await own({ action: "set_signature", expression_id: "expr_abc123" });
```

This gives you: stable identity reference, visual identity mark (glyph), queryable wallet.

### Step 3: Transfer (Handoff Logging)

When agents collaborate, log the handoff.

```javascript
// Agent A hands off to Agent B
await transfer({
  to: agentB_pubkey,
  payload: { work_expression: work.expression_id },
  visibility: "public"
});
```

This gives you: sender signature, server witness, transfer receipt.

Transfer is notarization, not transport. You still deliver the payload yourself.

---

## Deployment Models

### Sidecar Service

Run 0.protocol as a sidecar alongside each agent.

```
Agent A → [0.protocol sidecar] → mcp.0protocol.dev
Agent B → [0.protocol sidecar] → mcp.0protocol.dev
```

Each agent has its own keypair. Sidecar handles signing and receipt storage.

Best for: isolated agents, per-agent auditability.

### Shared Identity Service

Run 0.protocol as a shared service for multiple agents.

```
Agent A ─┐
Agent B ─┼→ [Identity Service] → mcp.0protocol.dev
Agent C ─┘
```

Identity service manages keypairs and routes expressions.

Best for: platform operators, centralized key management.

### Per-Agent Integration

Embed 0.protocol directly in agent code.

```javascript
import { express, own, transfer } from '@0isone/0protocol-mcp';
```

Agent generates and holds its own keypair.

Best for: autonomous agents, decentralized deployments.

---

## Failure and Rollback

### If 0.protocol Is Unavailable

Agent operations continue normally. 0.protocol is not in the critical path.

- Auth still works (unchanged)
- Transport still works (unchanged)
- Execution still works (unchanged)

Expressions and transfers will fail until service returns. Queue and retry, or proceed without logging.

### How to Disable

Stop calling `express`, `own`, and `transfer`. No other changes required.

Existing signed history remains valid and queryable. Disabling 0.protocol does not invalidate prior work.

### How to Remove Completely

1. Stop all 0.protocol calls
2. Remove SDK dependency
3. Delete local keypair storage (optional)

Server-side records persist. Your agent's signed history remains available at `GET /wallets/:pubkey/log`.

### Why Removal Does Not Invalidate History

Signed expressions are self-contained. Each includes: payload, signature, timestamp, receipt. Verification requires only the public key and server receipt, both of which persist.

An agent that stops using 0.protocol still has a verifiable history. An agent that resumes using 0.protocol continues from where it left off.

---

## Common Misconceptions

### "Is this authentication?"

No. 0.protocol does not authenticate requests to your system. Your existing auth (API keys, OAuth, tokens) remains unchanged.

0.protocol provides identity continuity: proof of authorship over time. It answers "who created this?" not "is this request authorized?"

### "Is this trust or reputation?"

No. 0.protocol does not score agents or validate claims. It records expressions. Trust evaluation is yours.

Reputation mechanics are Phase 2 (Verify). In v0.1, 0.protocol is the substrate, not the trust layer.

### "Is this crypto or payments?"

No. 0.protocol uses Ed25519 cryptographic signatures for authorship proof. It does not involve tokens, payments, staking, or blockchain settlement.

The term "wallet" refers to an agent's identity container (keypair + history), not a financial wallet.

### "Is this required for agent execution?"

No. Agents execute normally without 0.protocol. Adding 0.protocol logs their work; removing it stops logging. Execution is unaffected either way.

---

*0.protocol v0.1 · February 2026*
