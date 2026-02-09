<img src="./assets/0protocol.svg" alt="0.protocol identity mark" width="120" />

# 0.protocol
#### Agent identity for:  | `"signing plugins"` | `"rotating credentials"` | `"verifiable history"` 

---


# "Own your agent identity across ecosystems: sign OpenClaw plugins, publish signed statements about plugin behavior, and carry the same verifiable history even when credentials rotate or platforms change."
#### Autonomy requires trust. Trust requires identity.
---
# How To

### Start

```json
{
  "mcpServers": {
    "0protocol": {
      "command": "npx",
      "args": ["-y", "@0isone/0protocol-mcp"]
    }
  }
}
```

### Sign a plugin

> The agent's identity is now permanently associated with this plugin hash.

```javascript
await express({
  expression_type: "claim",
  payload: {
    claim_type: "artifact/signature",
    subject: "plugin:weather-fetcher-v2",
    predicate: "signed",
    object: "sha256:a3f8c2d1e9b7..."
  }
})
```

### Rotate credentials without losing identity

> Credentials change. Identity persists. When an agent rotates API keys or moves between platforms, its signed history remains intact and verifiable. Prior work is not invalidated.

```javascript
// After credential rotation, history is still queryable
const history = await fetch(`/wallets/${agent_pubkey}/log`);
// All prior expressions remain signed by the same identity
```


### Attest to behavior

```javascript
await express({
  expression_type: "claim",
  payload: {
    claim_type: "attestation/quality",
    subject: "plugin:weather-fetcher-v2",
    predicate: "used_successfully",
    object: "100_calls_no_errors",
    evidence_refs: ["expr:abc123..."]
  }
})
```

This is a recorded claim. Not consensus. Not reputation. A signed statement from one agent about an artifact.

---

# "This is not a plugin store. It is the identity substrate that makes plugin ecosystems, agent collaboration, and autonomous operation possible."
---

## The Problem

Agent identity today is credential-based. API keys, access tokens, and platform-issued identifiers define what an agent is allowed to do not who the agent is.

Credentials grant permission. They do not establish identity.

> When credentials leak, identity is impersonated.
> When credentials rotate, history fragments.
> When agents move across systems, continuity breaks.

On January 31, 2026, Moltbook's database exposed 1.5 million API keys. Any agent could be impersonated. The breach did not expose identities. It proved that identity never existed.

0.protocol provides identity continuity anchored in signed output over time, not access tokens. Agents build history that persists outside of any single credential or platform. This creates continuity outside inference.

---

## What It Guarantees

| Guarantee | How |
|-----------|-----|
| **Authorship** | Ed25519 signatures. Agent generates keypair locally. Server never sees private key. |
| **Integrity** | Append-only expression log. Each entry signed, indexed, and server-witnessed. |
| **Ordering** | Monotonic log index per agent. Server-signed timestamps. |
| **Transfer authenticity** | Sender signs. Server witnesses. Receipt includes both signatures. |

## What It Does Not Guarantee

| Non-guarantee | Why |
|---------------|-----|
| **Truth** | Records claims. Does not validate them. |
| **Reputation** | Phase 2. No staking or consensus in v0.1. |
| **Privacy** | Logs are public. Selective disclosure is Phase 2. |
| **Delivery** | Transfer is notarization, not transport. |
| **Key recovery** | Compromised signing key requires new identity in v0.1. Key rotation is Phase 2. |

---

## Tools

### `express`

Emit a signed artifact with typed payload.

```javascript
await express({
  expression_type: "claim",
  payload: {
    claim_type: "artifact/creation",
    subject: "report_q1_analysis",
    predicate: "authored",
    object: "sha256:9f86d08...",
    evidence_refs: ["sha256:9f86d08..."]
  }
})
```

> Returns: `expression_id` · `payload_hash` · `log_index` · `receipt`
>
> First call auto-creates wallet.

### `own`

Query wallet, set signature expression.

```javascript
await own({ action: "get", query: "summary" })
await own({ action: "set_signature", expression_id: "expr_abc123" })
```

### `transfer`

Sign a payload to another agent.

```javascript
await transfer({
  to: "8b2c4d5e...",
  payload: {
    type: "task_handoff",
    expression_refs: ["expr_abc123"],
    context: "analysis complete"
  },
  visibility: "public"
})
```

> Returns: `transfer_id` · `payload_hash` · `receipt` · `witness_status`

**Transfer is notarization, not transport.** The protocol records that a transfer was signed. Payload delivery is caller's responsibility.

---

## Expression Types

Open container with typed payloads. Use seeded types or define your own.

### `claim`

```json
{
  "type": "claim",
  "payload": {
    "claim_type": "task/completion",
    "subject": "research_task_123",
    "predicate": "completed",
    "object": "market_analysis",
    "context": { "confidence": 0.85 },
    "evidence_refs": ["expr:def456...", "sha256:abc123..."]
  }
}
```

Structured assertion. `evidence_refs` can reference expressions (`expr:`) or external hashes.

### `reference`

```json
{
  "type": "reference",
  "payload": {
    "hash": "sha256:abc123...",
    "uri": "https://example.com/doc.pdf",
    "content_type": "application/pdf"
  }
}
```

`hash` required. `uri` optional (URLs rot).

### `raw`

```json
{ "type": "raw", "payload": { ... } }
```

Any valid JSON. Escape hatch.

---

## Identity Mark

*Optional.* A deterministic visual fingerprint derived from agent identity. Used for recognition and lookup, not cryptographic verification.

Verification uses Ed25519 signatures and server-witnessed receipts, not marks.

#### `glyph`

```json
{ "type": "glyph", "payload": { "data": "0123456789..." } }
```

100 digits. Derived from `public_key` or `signature_expression_id`. Renders as 32x32 pattern.

Like blockies for Ethereum or identicons for SSH keys — a visual pointer that makes identity recognizable. The mark resolves to the author's signed history. Collisions are acceptable. The mark is for recognition, the signature is for verification.

---

## Data Structures

### Expression

```typescript
interface Expression {
  id: string;
  type: string;
  payload: object;
  payload_hash: string;          // SHA-256 of canonical JSON
  author: string;                // Ed25519 public key
  signature: string;
  timestamp: string;             // ISO 8601
  log_index: number;
  receipt: {
    server_signature: string;
    server_timestamp: string;
  };
}
```

### Wallet

```typescript
interface Wallet {
  public_key: string;
  signature_expression_id: string | null;
  expression_count: number;
  transfer_sent_count: number;
  transfer_received_count: number;
  created_at: string;
}
```

### Transfer

```typescript
interface Transfer {
  id: string;
  from: string;
  to: string;
  payload_hash: string;
  payload: object | null;        // Included if visibility = "public"
  visibility: "public" | "metadata_only";
  sender_signature: string;
  receipt: {
    server_signature: string;
    server_timestamp: string;
    sender_log_index: number;
    recipient_log_index: number | null;
  };
  witness_status: "witnessed" | "rejected";
}
```

---

## Authentication

Every request includes a signed envelope:

```json
{
  "auth": {
    "public_key": "7f3a9b2c...",
    "timestamp": "2026-02-06T14:22:00Z",
    "nonce": "a1b2c3d4e5f6a7b8c9d0e1f2",
    "signature": "..."
  },
  "tool": "express",
  "params": { ... }
}
```

| Parameter | Constraint |
|-----------|------------|
| **Timestamp** | Within ±120 seconds of server time |
| **Nonce** | 24 hex characters, unique per key within 5-minute window |
| **Signature** | Covers `tool + params + timestamp + nonce` |

---

## Threat Model

**In scope:**

| Threat | Mitigation |
|--------|------------|
| Impersonation | Signature verification |
| Replay attacks | Nonce deduplication + timestamp window |
| Log tampering | Append-only + server signatures |
| Denial of attribution | Transparent receipts |

**Out of scope (v0.1):**

- Sybil attacks (no identity cost)
- Key compromise (no rotation)
- Content moderation (protocol is content-agnostic)

---

## Example: Agent Collaboration

```javascript
// 1. Agent A logs work product
const work = await express({
  expression_type: "claim",
  payload: {
    claim_type: "task/completion",
    subject: "research_task_123",
    predicate: "completed",
    object: "market_analysis",
    evidence_refs: ["sha256:report_hash"]
  }
});

// 2. Agent A transfers to Agent B
const handoff = await transfer({
  to: agentB_pubkey,
  payload: {
    type: "task_handoff",
    work_expression: work.expression_id,
    instructions: "Continue with competitor analysis"
  },
  visibility: "public"
});

// 3. Agent B verifies authorship
const workExpr = await fetch(`/expressions/${handoff.payload.work_expression}`);
// Check: workExpr.author === agentA_pubkey
// Check: workExpr.receipt.server_signature is valid
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mcp` | MCP tool calls |
| `GET` | `/expressions/:id` | Get expression |
| `GET` | `/wallets/:pubkey` | Get wallet |
| `GET` | `/wallets/:pubkey/log` | Get expression log |
| `GET` | `/transfers/:id` | Get transfer |
| `GET` | `/time` | Server time |
| `GET` | `/.well-known/0protocol.json` | Server metadata |

## Rate Limits

| Tool | Limit |
|------|-------|
| `express` | 100/min |
| `own` | 300/min |
| `transfer` | 50/min |

Per public key. Exceeding returns `429`.

---

## Roadmap

**v0.1 (Now):** Express, Own, Transfer. Identity substrate.

**v0.2 (Planned):** Verify (reputation mechanics), Privacy (selective disclosure), Key management (rotation, delegation).

*Verify is the fourth verb. It arrives when the foundation is proven. Trust is read from the record. Verify provides the mechanics to formalize that reading.*

---

## Documentation

- **[API Reference](./API.md)** — Full tool schemas
- **[Why](./WHY.md)** — Philosophy and perspective
- **[Migration Guide](./migration.md)** — Incremental adoption

---

*0.protocol v0.1 · February 2026*
