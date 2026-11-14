---
title: "A data model for multiplayer editing: why we chose CRDTs"
date: 2026-11-10
description: When two people type on the same line at the same moment, whose character comes first? We start from the smallest possible example and work up to a data structure.
authors: [lin-yu, chen-an]
categories: [engineering]
tags: [collaboration, data structures, rust]
featured: true
cover: covers/crdt.svg
links:
  - title: Collaboration roadmap
    url: /about/
  - title: Sync protocol spec
    url: /about/
---

When two people type on the same line at the same moment, whose character comes first? It sounds like an interface detail. In practice it decides the data structure underneath the whole editor. This post starts from the smallest possible example and explains why Orbitline uses a *CRDT* (conflict-free replicated data type), and what that choice costs.

> [!NOTE]
> This post is sample content for the Gridline theme. Orbitline is fictional and nothing here is a real measurement.

## The problem: two inserts at one position

Start with an empty document. Alice inserts `a` at position 0 and Bob inserts `b` at position 0. Each applies their own edit first, then receives the other's:

- Alice has `a`, receives "insert `b` at 0", and ends up with `ba`
- Bob has `b`, receives "insert `a` at 0", and ends up with `ab`

The two documents have diverged. Every collaborative system has to answer **which one is right?** More importantly, both sides have to reach the same answer without asking each other.

![Two replicas insert at the same position; ordering by identifier makes them converge](diagrams/merge.svg "Figure 1: inserts carry unique identifiers, and one ordering rule makes both replicas converge.")

## Two roads: operational transformation and CRDTs

The classic approach is *operational transformation*: when a remote edit arrives, transform its position against the local edits that already happened. It works well with a central server that orders everything, but proving the transform functions correct is famously hard.

CRDTs come at it from the other side. Instead of describing an insert by *position*, every character gets a globally unique, ordered identifier. An insert says "place this after character X", not "place this at index 3".

| Aspect | Operational transformation | CRDT |
| --- | --- | --- |
| Needs central ordering | Usually | No |
| Offline editing | Hard | Natural |
| Memory cost | Low | Keeps tombstones |
| Correctness argument | Complex transforms | Follows from the structure |

### Offline is what we care about most

A big share of Orbitline use is closing the laptop on a train, writing anyway, and syncing on arrival. For operational transformation that is one very long run of unacknowledged edits. For a CRDT it is an ordinary merge.

```mermaid {caption="Figure 2: replica B keeps editing offline; once it reconnects, both sides exchange edits and sort by identifier into the same document."}
sequenceDiagram
    participant A as Replica A
    participant S as Sync service
    participant B as Replica B
    A->>S: insert "a" @ (1, A)
    Note over B: Offline, still editing
    B->>B: insert "b" @ (1, B)
    B->>S: Back online, send queued edits
    S-->>A: Forward insert "b"
    S-->>B: Forward insert "a"
    Note over A,B: Sorted by (clock, replica), both read "ab"
```

## The smallest implementation

Here is a simplified version. Every character carries an `Id` made of a replica number and a monotonic clock. Ordering compares the clock first and the replica second, so every replica sorts identically.

```rust {title="buffer/src/id.rs"}
/// A globally unique, totally ordered identifier for one character.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub struct Id {
    pub clock: u64,     // compared first
    pub replica: u32,   // breaks ties between replicas
}

pub struct Char {
    pub id: Id,
    pub after: Option<Id>, // the character this one was inserted after
    pub value: char,
    pub deleted: bool,     // tombstone: never removed, only hidden
}
```

Deleting never removes a character; it leaves a tombstone. That is the most common complaint about CRDTs: documents only grow. We compact in the background once every replica has acknowledged a delete.

```diff
 fn apply(&mut self, op: Op) {
     match op {
         Op::Insert(c) => self.integrate(c),
-        Op::Delete(id) => self.chars.remove(&id),
+        Op::Delete(id) => self.mark_deleted(id),
     }
 }
```

> Choosing a data structure is choosing where you are willing to pay for complexity.

## Costs and trade-offs

CRDTs are not free. We accepted three things:

1. **Memory**: tombstones and identifiers add a fixed overhead per character.
2. **Intent**: "consistent order" is not the same as "what the user meant"; interleaved inserts can still read oddly.
3. **Debugging**: bugs often appear only under one particular merge order, so we need replayable operation logs.

> [!WARNING]
> If your product always has a central server and almost never edits offline, operational transformation may still be the simpler choice.

## Next

The next post covers the tombstone compaction algorithm and how it runs in the background without blocking input. Keystroke latency is the one thing we refuse to trade away; see [the render loop post](/blog/render-loop/) for more.

To try it locally, press {{< kbd "⌘ K" >}} and run `collab: share`.[^demo]

[^demo]: Sample content: neither Orbitline nor this command exists.
