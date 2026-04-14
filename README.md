# 🔍 YouTube Growing Channel Finder

[日本語](#japanese) | English

Automatically discovers fast-growing YouTube channels using a custom "Buzz Index" metric (avg views ÷ subscribers).  
Built with Google Apps Script + YouTube Data API v3.

## ✨ Features

- 📊 **Buzz Index** — Custom metric (avg views ÷ subscribers) to rank growth potential
- 🔎 **Smart filtering** — Channels under 1 year old with 500+ subscribers only
- 🔒 **Secure API key** — Stored in ScriptProperties, never hardcoded
- ⚡ **One-click execution** — Run from Google Sheets custom menu

## 🛠 Tech Stack

- Google Apps Script
- YouTube Data API v3
- Google Sheets

## 🚀 Setup

1. Open Google Sheets → Extensions → Apps Script
2. Paste the code and save
3. Reload the spreadsheet
4. Run **🔑 API Key Registration** from the menu
5. Run **▶ Find Growing Channels** and enter a keyword

## 📝 Notes

- Developed through AI collaboration (vibe coding)
- Requires a YouTube Data API v3 key ([Google Cloud Console](https://console.cloud.google.com/))

---

<a id="japanese"></a>

# 🔍 YouTube急成長チャンネル発見ツール

独自指標「バズり指数」（平均再生数 ÷ 登録者数）で急成長チャンネルを自動抽出します。  
Google Apps Script + YouTube Data API v3 で動作します。

## ✨ 機能

- 📊 **バズり指数** — 平均再生数÷登録者数で成長ポテンシャルをスコアリング
- 🔎 **絞り込み** — 運用1年以内・登録者500人以上に限定してノイズを除去
- 🔒 **APIキー安全管理** — ScriptPropertiesに格納、コードに直書きしない設計
- ⚡ **ワンクリック実行** — スプレッドシートのカスタムメニューから起動

## 🛠 使用技術

- Google Apps Script
- YouTube Data API v3
- Google スプレッドシート

## 🚀 セットアップ

1. Google スプレッドシートを開く → 拡張機能 → Apps Script
2. コードを貼り付けて保存
3. スプレッドシートを再読み込み
4. メニューから「🔑 APIキー登録」を実行
5. 「▶ 急成長チャンネル検索」を実行してキーワードを入力

## 📝 開発メモ

- AIとの協働（バイブコーディング）で開発
- YouTube Data API v3 のAPIキーが必要です（[Google Cloud Console](https://console.cloud.google.com/)）
