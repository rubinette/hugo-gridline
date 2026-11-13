---
title: 把設定檔當成程式碼
date: 2026-07-30
description: 設定檔也需要版本控制、型別檢查與測試。我們如何讓 Orbitline 的設定檔具備這三件事。
authors: [chen-an]
categories: [engineering]
tags: [設定, rust]
---

設定檔一開始總是很小，直到有一天它變成整個團隊共用、沒人敢動的那個檔案。

## 型別

每一個設定鍵都有對應的結構定義，編輯器會根據它提供補完與即時驗證。

```rust
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EditorSettings {
    pub tab_size: NonZeroU8,
    pub soft_wrap: SoftWrap,
    pub format_on_save: bool,
}
```

## 分層

設定分成三層：預設值、使用者設定、專案設定。後面的覆蓋前面的，而且每個值都能查到它來自哪一層。

| 層級 | 位置 | 會進版本控制 |
| --- | --- | --- |
| 預設值 | 內建 | 否 |
| 使用者 | `~/.config/orbit/settings.toml` | 視個人習慣 |
| 專案 | `.orbit/settings.toml` | 是 |

> [!CAUTION]
> 專案設定會被所有協作者套用，請避免在裡面放個人偏好，例如字型大小。
