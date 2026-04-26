#!/usr/bin/env python3
"""Runbook materializer: events → canonical markdown with frontmatter.

Reads cycle-receipts.ndjson (pre-envelope era format), reduces by cycle_id,
and renders deterministic canonical markdown articles with YAML frontmatter
per the frontmatter schema (C1).

Usage:
    materialize.py --source <ndjson> --output-dir <dir> [--cycle-id <id>]
    materialize.py --source <ndjson> --output-dir <dir> --all
    materialize.py --source <ndjson> --output-dir <dir> --all --wiki-compat

--wiki-compat: emit frontmatter compatible with runbook/schema.md (wiki layer).
  Maps: source_refs→sources, last_materialized_at→created+updated,
        document_type→tags (list), adds related:[].
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone


def read_events(source_path):
    """Read all entries from an ndjson file."""
    events = []
    with open(source_path, "r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                events.append((lineno, json.loads(line)))
            except json.JSONDecodeError:
                pass
    return events


def group_by_cycle(events):
    """Group events by cycle_id."""
    groups = {}
    for lineno, event in events:
        cid = event.get("cycle_id")
        if not cid:
            continue
        if cid not in groups:
            groups[cid] = []
        groups[cid].append((lineno, event))
    return groups


def slugify(cycle_id):
    """Convert cycle_id to a safe filename slug."""
    return str(cycle_id).replace("/", "_").replace(" ", "_").replace(":", "_")


def render_wiki_frontmatter(cycle_id, events, source_path, ts_override=None):
    """Render wiki schema.md-compatible YAML frontmatter.

    Field mapping (P1 adapter):
      source_refs       → sources
      last_materialized_at → created (date) + updated (date)
      document_type     → tags (list)
      related           → [] (populated in P3 via index-node backlinks)
    """
    first_ev = events[0][1]
    last_ev = events[-1][1]

    mat_ts = ts_override or datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    mat_date = mat_ts[:10]

    # created: earliest event ts date; updated: materialization date
    created_ts = first_ev.get("ts", mat_ts)
    created_date = created_ts[:10] if created_ts else mat_date

    source_refs = [f"{source_path}#L{ln}" for ln, _ in events]

    lines = [
        "---",
        f"title: \"{cycle_id}\"",
        "sources:",
    ]
    for ref in sorted(set(source_refs)):
        lines.append(f"  - {ref}")
    lines.append("related: []")
    lines.append("tags:")
    lines.append("  - cycle_article")
    lines.append(f"created: {created_date}")
    lines.append(f"updated: {mat_date}")
    lines.append("---")

    return "\n".join(lines)


def render_frontmatter(cycle_id, events, source_path):
    """Render YAML frontmatter block from events."""
    first = events[0][1]
    last = events[-1][1]
    ts = last.get("ts", datetime.now(timezone.utc).isoformat())
    actor = last.get("session", "unknown")

    evidence_refs = []
    for _, ev in events:
        evidence_refs.extend(ev.get("evidence_refs", []))

    seed_refs = []
    for _, ev in events:
        seed_refs.extend(ev.get("promoted_seeds", []))

    receipt_refs = [f"cycle-receipts.ndjson#L{ln}" for ln, _ in events]

    source_refs = [f"{source_path}#L{ln}" for ln, _ in events]

    lines = [
        "---",
        "schema_version: 1",
        f"document_id: \"cycle_article.{slugify(cycle_id)}\"",
        "document_type: cycle_article",
        f"title: \"{cycle_id}\"",
        "status: materialized",
        f"source_of_record: \"{source_path}\"",
        "materialized_from_events:",
    ]
    for ln, _ in events:
        lines.append(f"  - \"pre_envelope.line_{ln}\"")

    lines.append("anchor_ids:")
    lines.append(f"  - \"{cycle_id}\"")

    lines.append("source_refs:")
    for ref in sorted(set(source_refs)):
        lines.append(f"  - \"{ref}\"")

    lines.append("evidence_refs:")
    for ref in sorted(set(evidence_refs)):
        lines.append(f"  - \"{ref}\"")

    lines.append("receipt_refs:")
    for ref in receipt_refs:
        lines.append(f"  - \"{ref}\"")

    lines.append("index_refs: []")

    lines.append("seed_refs:")
    for ref in sorted(set(seed_refs)):
        lines.append(f"  - \"{ref}\"")

    lines.append("code_commit: null")
    lines.append("environment_commit: null")
    lines.append(f"last_materialized_at: \"{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}\"")
    lines.append("materializer_version: \"materialize.py.001\"")
    lines.append("namespace:")
    lines.append("  organ: runbook")
    lines.append("  layer: wiki")
    lines.append("---")

    return "\n".join(lines)


def render_body(cycle_id, events):
    """Render the article body from events."""
    lines = []
    lines.append(f"# {cycle_id}")
    lines.append("")

    for _, ev in events:
        ts = ev.get("ts", "?")
        actor = ev.get("session", "?")
        lines.append(f"**Timestamp:** {ts}  ")
        lines.append(f"**Actor:** {actor}  ")

        act = ev.get("act")
        if act:
            lines.append(f"**Action:** {act}  ")

        measure = ev.get("measure")
        if measure:
            lines.append("")
            lines.append("**Measure:**")
            lines.append(f"> {measure}")

        select = ev.get("select", ev.get("terminal_outcome"))
        if select:
            lines.append("")
            lines.append(f"**Outcome:** `{select}`")

        constraints = ev.get("discovered_constraints", [])
        if constraints:
            lines.append("")
            lines.append("**Discovered Constraints:**")
            for c in constraints:
                lines.append(f"- {c}")

        evidence = ev.get("evidence_refs", [])
        if evidence:
            lines.append("")
            lines.append("**Evidence:**")
            for e in evidence:
                lines.append(f"- `{e}`")

        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def materialize_cycle(cycle_id, events, source_path, output_dir, ts_override=None, wiki_compat=False):
    """Materialize a single cycle into canonical markdown."""
    if wiki_compat:
        frontmatter = render_wiki_frontmatter(cycle_id, events, source_path, ts_override)
    else:
        frontmatter = render_frontmatter(cycle_id, events, source_path)

    body = render_body(cycle_id, events)

    # Override last_materialized_at for determinism in testing (non-wiki-compat only)
    if ts_override and not wiki_compat:
        frontmatter = frontmatter.replace(
            f"last_materialized_at: \"{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}\"",
            f"last_materialized_at: \"{ts_override}\""
        )

    content = frontmatter + "\n\n" + body
    filename = f"cycle_article_{slugify(cycle_id)}.md"
    filepath = os.path.join(output_dir, filename)

    os.makedirs(output_dir, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return filepath, content_hash


def main():
    parser = argparse.ArgumentParser(description="Runbook materializer")
    parser.add_argument("--source", required=True, help="Path to ndjson event source")
    parser.add_argument("--output-dir", required=True, help="Output directory for articles")
    parser.add_argument("--cycle-id", help="Materialize a single cycle")
    parser.add_argument("--all", action="store_true", help="Materialize all cycles")
    parser.add_argument("--ts-override", help="Override last_materialized_at for determinism")
    parser.add_argument("--wiki-compat", action="store_true",
                        help="Emit wiki schema.md-compatible frontmatter (sources, created, updated, tags, related)")
    args = parser.parse_args()

    events = read_events(args.source)
    groups = group_by_cycle(events)

    if args.cycle_id:
        if args.cycle_id not in groups:
            print(f"ERROR: cycle_id '{args.cycle_id}' not found in {args.source}", file=sys.stderr)
            return 1
        path, h = materialize_cycle(args.cycle_id, groups[args.cycle_id], args.source, args.output_dir,
                                    args.ts_override, args.wiki_compat)
        print(json.dumps({"cycle_id": args.cycle_id, "path": path, "sha256": h}))
        return 0

    if args.all:
        results = []
        for cid in sorted(groups.keys(), key=str):
            path, h = materialize_cycle(cid, groups[cid], args.source, args.output_dir,
                                        args.ts_override, args.wiki_compat)
            results.append({"cycle_id": cid, "path": path, "sha256": h})
        for r in results:
            print(json.dumps(r))
        return 0

    print("ERROR: specify --cycle-id or --all", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
