---
title: Orbitline 0.9：分割視窗、遠端工作區與新的命令面板
date: 2026-10-15
description: 0.9 版帶來可任意分割的視窗、連線到遠端機器的工作區，以及重新設計的命令面板。
authors: [chou-yiheng]
categories: [product]
tags: [版本說明]
featured: true
cover: covers/layers.svg
---

0.9 版是到目前為止最大的一次更新。以下是重點整理，完整的變更紀錄請見版本頁面。

## 分割視窗

現在可以把任何分頁拖到視窗邊緣，水平或垂直分割。分割的配置會跟著工作區一起儲存。

## 遠端工作區

透過 SSH 連線到遠端機器，檔案瀏覽、搜尋與語言伺服器都在遠端執行，本機只負責顯示。

```sh
orbit remote add build-box user@10.0.0.12
orbit open build-box:~/projects/api
```

## 新的命令面板

命令面板改成模糊比對，並且會記住你最常用的指令。詳細的使用方式可以參考[命令面板的八個小技巧](/blog/command-palette-tips/)。

> [!IMPORTANT]
> 0.9 版的設定檔格式有變動，第一次啟動時會自動轉換，並保留一份舊設定的備份。
