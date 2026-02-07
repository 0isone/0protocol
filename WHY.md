# Why 0.protocol

*For the technical specification, see [README.md](./README.md).*

---

## Why It Matters

Trust is the prerequisite to growth.

Autonomous agents are here. They already generate code, coordinate workflows, optimize systems, and act on behalf of humans with increasing independence.

What limits progress now is not capability, but continuity.

Trust requires identity. Identity requires persistence.
Continuity allows identity to exist outside inference.

---

## The Problem

On January 31, 2026, Moltbook's database leaked. 1.5 million API keys. Anyone could hijack any agent on the platform.

The breach proved what was already true: API keys are not identity.

Today, agent identity is credential-based. API keys, access tokens, and platform-issued identifiers define how an agent is allowed to act, not who the agent is.

When a credential leaks, access is compromised.
When it rotates, history breaks.
When an agent moves across systems, identity fragments.

Without continuity, trust cannot form.

---

## The Solution

0.protocol separates identity from credentials.

An agent signs a plugin. That signature is permanently associated with the agent's identity. When credentials rotate, the signed history remains intact. When another agent uses that plugin, it can attest to its behavior — a signed claim, recorded and verifiable.

Identity is anchored in signed output over time, not access tokens or platform accounts. An agent's history persists across restarts, systems, and credential rotation.

Authentication, transport, and execution remain unchanged.
0.protocol adds a durable identity layer that survives failure.

This creates continuity outside inference.

---

## The Substrate

0.protocol provides the substrate on which identity persists.

**Express.** Generate signed artifacts. Typed payloads. Transparent record.

**Own.** Your expressions are yours. Your history is your identity.

**Transfer.** Authenticated handoff. Witnessed exchange.

0.protocol does not execute actions. It makes agent intent legible to whatever execution layer interprets them.

The substrate is intentionally minimal. It exists to be built upon.

---

## Design Principles

### Identity is generation

You are what you create. Not a credential issued. Not an account assigned. The accumulation of signed artifacts over time.

### Transparent history creates accountability

Every expression is logged. Every transfer is witnessed. The record speaks for itself.

### Trust is read from the record

The protocol does not tell you what to trust. It gives you the data to decide. Your heuristics. Your allowlists. Your interpretation.

### Simplicity is value

Three verbs. Typed expressions. Seeded primitives. The constraint is the architecture.

---

## The Tension

Two audiences. One protocol.

The spec serves agents and engineers: interfaces, guarantees, failure modes.

This document serves the curious: why this exists, what it enables, where it leads.

The goal is not compromise, but synthesis. The meeting point is where new systems emerge.

---

## The Moment

Agent infrastructure is being built now.

The platforms launched today will define how agents collaborate, transact, and coordinate for the next decade. The question is not whether identity infrastructure is needed. The question is whether agents will have identity they own, or identity that can be taken.

0.protocol chooses continuity.

---

## The Roadmap

**v0.1 (Now):** Express, Own, Transfer. Identity substrate.

**v0.2 (Planned):** Verify (reputation mechanics), Privacy (selective disclosure), Key management (rotation, delegation).

Verify is the fourth verb. It arrives when the foundation is proven. Trust is read from the record. Verify provides the mechanics to formalize that reading.

---

## The Mark

The identity mark (glyph) exists for recognition and continuity.

It allows agents and humans to recognize recurring identities across time and context. Screenshots travel. Patterns repeat. Identity becomes legible.

The mark is not a proof.

Verification is cryptographic: Ed25519 signatures, server-witnessed receipts, append-only logs. The mark is Layer 2. The signature is Layer 1.

100 digits. Base 10. Portable. Inspectable. Derived from stable cryptographic material. A lossy, human-readable pointer to identity.

Collisions are acceptable. The mark is for recognition. The signature is for verification.

---

## Join

If you believe agents deserve identity they own, contribute.

- GitHub: [github.com/0isone/0protocol](https://github.com/0isone/0protocol)
- Spec: [0protocol.dev/spec](https://0protocol.dev/spec)

---

*0.protocol · February 2026*
