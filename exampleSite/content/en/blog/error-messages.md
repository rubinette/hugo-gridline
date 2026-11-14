---
title: How to write a good error message
date: 2026-06-18
description: A good error message answers three questions — what happened, why, and what to do next.
authors: [hsu-jo]
categories: [tips]
tags: [design, writing]
---

A good error message answers three questions: **what happened, why, and what to do next.**

## An example

A poor version:

```text
Error: failed to open workspace
```

A better one:

```text
Can't open workspace "api": the node executable referenced on line 12 of .orbit/settings.toml was not found.
→ Install node, or set runtime.node in your settings to the correct path.
```

## Three principles

- Describe the problem in the user's terms, not the program's internal names
- Point to the exact place: file, line, settings key
- Offer a next step the user can take right away
