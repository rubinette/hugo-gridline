---
title: 多人編輯的資料模型：為什麼我們選擇 CRDT
date: 2026-11-10
description: 兩個人同時在同一行打字時，誰的字該排在前面？這篇文章從一個最小的例子出發，說明我們如何選擇協作編輯的資料結構。
authors: [lin-yu, chen-an]
categories: [engineering]
tags: [協作, 資料結構, rust]
featured: true
cover: covers/crdt.svg
links:
  - title: 協作功能路線圖
    url: /about/
  - title: 同步協定規格
    url: /about/
---

兩個人同時在同一行打字時，誰的字該排在前面？這個問題看起來像是介面細節，實際上決定了整個編輯器的資料結構。這篇文章從一個最小的例子出發，說明我們為什麼在 Orbitline 裡選擇了 *CRDT*（無衝突複製資料型別），以及這個選擇帶來的代價。

> [!NOTE]
> 本文是 Gridline 佈景主題的示範內容。Orbitline 是虛構產品，文中沒有任何真實的效能數據。

## 問題：同一個位置，兩個插入

假設文件內容是空的，甲在位置 0 插入 `a`，乙也在位置 0 插入 `b`。兩邊各自套用自己的操作之後，再收到對方的操作：

- 甲看到的是 `a`，然後收到「在位置 0 插入 `b`」，得到 `ba`
- 乙看到的是 `b`，然後收到「在位置 0 插入 `a`」，得到 `ab`

兩份文件從此分歧。任何協作系統都必須回答：**最後應該是哪一個？** 更重要的是，兩邊要怎麼在不互相詢問的情況下得到同一個答案。

![兩個副本在同一位置插入字元，依識別碼排序後收斂成相同結果](diagrams/merge.svg "圖一：插入操作帶著唯一識別碼，排序規則讓兩個副本收斂。")

## 兩條路：操作轉換與 CRDT

傳統的做法是*操作轉換*（Operational Transformation）：收到遠端操作時，根據本地已經發生的操作去「轉換」它的位置。這在有中央伺服器排序時運作良好，但轉換函式的正確性證明出了名地困難。

CRDT 換了一個角度：不再用「位置」描述插入，而是讓每個字元都有一個全域唯一、可排序的識別碼。插入操作說的是「把這個字元放在識別碼 X 的後面」，而不是「放在第 3 個位置」。

| 面向 | 操作轉換 | CRDT |
| --- | --- | --- |
| 需要中央排序 | 通常需要 | 不需要 |
| 離線編輯 | 困難 | 自然支援 |
| 記憶體成本 | 低 | 需保留刪除標記 |
| 正確性推導 | 轉換函式複雜 | 由資料結構保證 |

### 我們最在意的是離線

Orbitline 的使用情境裡，有很大一部分是筆電闔上、在高鐵上繼續寫，然後下車再同步。對操作轉換來說，這等於一段很長的「未確認操作」；對 CRDT 來說，這只是普通的合併。

## 最小的實作

下面是簡化過的資料結構。每個字元帶著一個 `Id`，由副本編號與遞增的時鐘組成；排序時先比時鐘，再比副本編號，確保所有副本得到相同的順序。

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

刪除不會真的移除字元，而是留下一個「墓碑」標記。這是 CRDT 最常被詬病的地方：文件會越來越大。我們的做法是在所有副本都確認看過某個刪除之後，再於背景壓縮。

```diff
 fn apply(&mut self, op: Op) {
     match op {
         Op::Insert(c) => self.integrate(c),
-        Op::Delete(id) => self.chars.remove(&id),
+        Op::Delete(id) => self.mark_deleted(id),
     }
 }
```

> 選擇資料結構，其實就是選擇你願意在哪裡付出複雜度。

## 代價與取捨

CRDT 不是免費的。我們在這個決定裡接受了三件事：

1. **記憶體**：墓碑與識別碼讓每個字元多出固定的開銷。
2. **意圖**：「排序一致」不等於「符合使用者意圖」，交錯插入的文字仍然可能讀起來很怪。
3. **除錯**：問題常常只在特定的合併順序下出現，需要可重播的操作紀錄。

> [!WARNING]
> 如果你的產品一定有中央伺服器、而且幾乎不需要離線編輯，操作轉換可能仍是更簡單的選擇。

## 接下來

下一篇會談壓縮墓碑的演算法，以及我們如何在不阻塞輸入的前提下，在背景完成它。按鍵延遲是我們最不願意犧牲的東西 —— 這部分可以參考[渲染迴圈那篇文章](/blog/render-loop/)。

如果想在本機試試看，可以用 {{< kbd "⌘ K" >}} 打開命令面板，輸入 `collab: share` 開始一個協作工作階段。[^demo]

[^demo]: 這是示範內容，Orbitline 與這個指令並不存在。
