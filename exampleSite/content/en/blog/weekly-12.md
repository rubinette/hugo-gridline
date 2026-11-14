---
title: "Weekly #12"
date: 2026-09-12
description: The first version of tombstone compaction, schema validation for settings, and a bug about line endings.
authors: [chen-an, chou-yiheng]
categories: [weekly]
tags: [weekly]
---

Three things from this week.

## Tombstone compaction

The first version of background compaction has been merged. For now it only runs when every replica is online; offline replicas come in the next release.

## Settings validation

Settings files are now validated against their schema on save, and errors are marked on the line they belong to instead of popping up a dialog.

## A line-ending bug

Windows line endings (`\r\n`) were counted as two characters during collaboration, which shifted cursor positions. The fix normalises them before text enters the buffer.
