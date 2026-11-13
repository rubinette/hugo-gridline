---
title: A render loop that never blocks input
date: 2026-10-28
description: What happens between a keypress and the character on screen? We split the render loop into three phases so input always goes first.
authors: [lin-yu]
categories: [engineering]
tags: [performance, rendering]
cover: covers/frames.svg
---

What happens between a keypress and the character appearing on screen? In most editors the answer is "it depends". If the parser, a file watcher or an extension happens to be busy, that keypress waits in line.

Our goal is simple: **input always goes first.**

## A three-phase loop

Every frame is split into three phases:

1. Drain all pending input and update the buffer immediately
2. Re-lay out only the lines that changed
3. Hand whatever time is left to background work

```mermaid {caption="One frame: input always goes first; background work only gets the time that is left."}
flowchart LR
    input[Drain input] --> layout[Re-lay out changed lines]
    layout --> budget{Budget left?}
    budget -- yes --> work[Run one background job]
    work --> budget
    budget -- no --> paint[Paint the frame]
```

```ts {title="loop.ts"}
function frame(budget: number) {
  const start = performance.now();
  drainInput();                 // never deferred
  layoutDirtyLines();
  while (performance.now() - start < budget) {
    if (!background.runOne()) break;
  }
  requestAnimationFrame(() => frame(budget));
}
```

## Background work must be sliceable

The key is that background work can pause at any point. The parser became incremental and handles a small range at a time; file indexing became a per-file work queue.

> [!TIP]
> If a background job cannot be sliced, move it to another thread rather than into the frame loop.
