---
title: "Orbitline 0.9: splits, remote workspaces and a new command palette"
date: 2026-10-15
description: Version 0.9 brings free-form split panes, workspaces on remote machines and a redesigned command palette.
authors: [chou-yiheng]
categories: [product]
tags: [release notes]
featured: true
cover: covers/layers.svg
---

0.9 is our biggest release so far. Here are the highlights.

## Split panes

Drag any tab to the edge of the window to split horizontally or vertically. The layout is saved with the workspace.

## Remote workspaces

Connect to a remote machine over SSH. File browsing, search and language servers run remotely; your machine only draws.

```sh
orbit remote add build-box user@10.0.0.12
orbit open build-box:~/projects/api
```

## A new command palette

The palette now uses fuzzy matching and remembers the commands you use most.

> [!IMPORTANT]
> The settings format changed in 0.9. It is migrated on first launch, and a backup of the old file is kept.
