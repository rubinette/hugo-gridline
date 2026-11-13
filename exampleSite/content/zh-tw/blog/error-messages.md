---
title: 如何寫一則好的錯誤訊息
date: 2026-06-18
description: 好的錯誤訊息回答三個問題：發生了什麼、為什麼、接下來該怎麼做。
authors: [hsu-jo]
categories: [tips]
tags: [設計, 文案]
---

好的錯誤訊息回答三個問題：**發生了什麼、為什麼、接下來該怎麼做。**

## 一個例子

不好的版本：

```text
Error: failed to open workspace
```

比較好的版本：

```text
無法開啟工作區「api」：找不到 .orbit/settings.toml 第 12 行引用的 node 執行檔。
→ 安裝 node，或在設定中把 runtime.node 改成正確的路徑。
```

## 三個原則

- 用使用者的語言描述問題，而不是程式內部的名稱
- 指出具體的位置：檔案、行號、設定鍵
- 給一個可以馬上執行的下一步
