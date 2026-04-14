# YouTube 急成長チャンネル発見ツール

キーワード検索で YouTube の急成長チャンネルを自動抽出し、Google スプレッドシートにランキング表示するツールです。
# YouTube Growing Channel Finder
Automatically discovers fast-growing YouTube channels using a custom "Buzz Index" metric.
Built with Google Apps Script + YouTube Data API v3.

## 特徴
- 独自指標「バズり指数」（平均再生数 ÷ 登録者数）で急成長チャンネルをスコアリング
- 運用1年以内・登録者500人以上に絞り込み、ノイズを除去
- APIキーは ScriptProperties に安全格納（コードに直書きしない設計）
- Google スプレッドシートのカスタムメニューからワンクリックで起動
## Features
- Custom "Buzz Index" (avg views ÷ subscribers) to rank growth potential
- Filters channels under 1 year old with 500+ subscribers
- Secure API key storage via ScriptProperties
- One-click execution from Google Sheets custom menu



## 必要なもの

- Google アカウント
- YouTube Data API v3 の APIキー（[Google Cloud Console](https://console.cloud.google.com/) で取得）

## セットアップ

1. Google スプレッドシートを新規作成
2. メニューの「拡張機能」→「Apps Script」を開く
3. `youtube_channel_research.gs` の内容をエディタに貼り付けて保存
4. スプレッドシートを再読み込みすると「🌌 YouTubeリサーチ」メニューが追加される
5. 「🔑 APIキー登録」を実行して APIキーを保存

## 使い方

1. 「🌌 YouTubeリサーチ」→「▶ 急成長チャンネル検索」を実行
2. キーワードを入力（例: `Dark Ambient`、`Study Music`）
3. 結果が新しいシートに出力される

## 出力項目

| 項目 | 説明 |
|------|------|
| チャンネル名 | チャンネルのタイトル |
| 運用期間 | チャンネル開設からの日数 |
| 登録者数 | チャンネル登録者数 |
| バズり指数🔥 | 平均再生数 ÷ 登録者数（高いほど急成長） |
| 平均再生数 | 全動画の平均再生数 |
| 開設日 | チャンネル開設日 |
| URL | チャンネルへのリンク |

## パラメータ調整

`CONFIG` オブジェクトで動作をカスタマイズできます。

```javascript
const CONFIG = {
  MAX_RESULTS: 30,    // 検索結果の最大件数
  MONTHS_AGO: 12,     // 何ヶ月前までの動画を対象にするか
  MIN_SUBS: 500,      // 最低登録者数（ノイズ除去）
  AGE_LIMIT: 1.0,     // チャンネル運用期間の上限（年）
  INDEX_FLOOR: 1000,  // バズり指数の分母最低値（異常値防止）
};
```

## 注意事項

- YouTube Data API の無料枠には1日あたりのクォータ制限があります
- APIキーは必ず ScriptProperties に保存し、コードに直接記述しないでください
