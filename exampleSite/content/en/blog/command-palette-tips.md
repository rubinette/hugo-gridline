---
title: Eight command palette tips
date: 2026-09-30
description: From fuzzy matching to custom aliases, eight ways to get more out of the command palette.
authors: [hsu-jo]
categories: [tips]
tags: [command palette, keyboard]
---

The command palette is the most-opened surface in the whole editor. Here are eight things it can do that you might not know about.

## The basics

1. {{< kbd "⌘ K" >}} opens the palette; type any fragment of a command's name
2. Start with `>` to search commands only, or `@` to search symbols in the current file
3. {{< kbd "↑" >}} brings back the last command you ran

## Going further

4. Add aliases for the commands you use most in your settings file
5. Press {{< kbd "Tab" >}} to complete a command's arguments
6. The gray text after a command is its shortcut; you will pick them up over time
7. Press {{< kbd "⌘ ," >}} on any command to change its shortcut
8. The palette ranks commands by how often you use them, so there is nothing to tidy by hand

```toml {title="settings.toml"}
[palette.aliases]
fmt = "editor: format document"
gs  = "git: status"
```
