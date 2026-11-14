---
title: Treat your settings file like code
date: 2026-07-30
description: Settings files need version control, type checking and tests too. Here is how Orbitline gives its settings all three.
authors: [chen-an]
categories: [engineering]
tags: [settings, rust]
---

A settings file always starts small, until one day it is the file the whole team shares and nobody dares to touch.

## Types

Every settings key has a matching struct definition, and the editor uses it for completion and live validation.

```rust
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EditorSettings {
    pub tab_size: NonZeroU8,
    pub soft_wrap: SoftWrap,
    pub format_on_save: bool,
}
```

## Layers

Settings come in three layers: defaults, user settings and project settings. Later layers override earlier ones, and every value can tell you which layer it came from.

```mermaid
flowchart LR
    defaults[Defaults] --> user[User settings] --> project[Project settings] --> effective((Effective settings))
```

| Layer | Location | In version control |
| --- | --- | --- |
| Defaults | Built in | No |
| User | `~/.config/orbit/settings.toml` | Up to you |
| Project | `.orbit/settings.toml` | Yes |

> [!CAUTION]
> Project settings apply to every collaborator. Keep personal preferences, such as font size, out of them.
