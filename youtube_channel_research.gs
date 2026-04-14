// ============================================================
// YouTube 急成長チャンネル発見ツール
// Google スプレッドシート + YouTube Data API v3
//
// 機能：
//   - キーワードで YouTube を検索し、急成長チャンネルを自動抽出
//   - 独自指標「バズり指数」（平均再生数 ÷ 登録者数）でランキング
//   - 運用1年以内・登録者500人以上のチャンネルに絞り込み
//   - APIキーは ScriptProperties に安全格納（コードに直書きしない）
//
// 使い方：
//   ① スプシを開くとメニュー「🌌 YouTubeリサーチ」が自動追加される
//   ② 「🔑 APIキー登録」でAPIキーを安全に保存
//   ③ 「▶ 急成長チャンネル検索」を実行
//   ④ キーワードを入力するとシートに結果が出力される
// ============================================================

const CONFIG = {
  MAX_RESULTS: 30,
  MONTHS_AGO: 12,
  MIN_SUBS: 500,      // ノイズ除去用：最低登録者数
  AGE_LIMIT: 1.0,     // 運用1年以内に限定（年単位）
  INDEX_FLOOR: 1000,  // バズり指数の安定化用（分母の最低値）
};

// ============================================================
// 🔑 APIキー登録
// ============================================================
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '🔑 YouTube APIキー登録',
    'AIza... から始まる39文字のキーを正確に貼り付けてください。',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const key = response.getResponseText().trim();
    if (key.length !== 39 || !key.startsWith("AIza")) {
      ui.alert('⚠️ 入力内容を確認してください。\nYouTube APIキーは「AIza」から始まる39文字です。');
      return;
    }
    PropertiesService.getScriptProperties().setProperty('YOUTUBE_API_KEY', key);
    ui.alert('✅ APIキーを安全に保存しました。\nコードにキーが含まれないため、共有時も安心です。');
  }
}

function getApiKey() {
  return PropertiesService.getScriptProperties().getProperty('YOUTUBE_API_KEY');
}

// ============================================================
// ▶ メイン実行
// ============================================================
function findGrowingChannels() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const apiKey = getApiKey();
  if (!apiKey) {
    ui.alert("⚠️ APIキーが設定されていません。\nメニューから「🔑 APIキー登録」を先に実行してください。");
    return;
  }

  const response = ui.prompt(
    '🔍 急成長チャンネル検索',
    '調べたいジャンルを入力してください（例: Dark Ambient）',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const keyword = response.getResponseText().trim();
  if (!keyword) return;

  try {
    const results = searchGrowingChannels(keyword, apiKey);

    if (results.length === 0) {
      ui.alert(`「${keyword}」で条件に合うチャンネルは見つかりませんでした。`);
      return;
    }

    const sheetName = ("新星_" + keyword.substring(0, 10)).replace(/[\\/:*?"<>|]/g, "_");
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) sheet.clear(); else sheet = ss.insertSheet(sheetName);

    // ヘッダー
    const headers = ["チャンネル名", "運用期間", "登録者数", "バズり指数🔥", "平均再生数", "開設日", "URL"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#1f2836")
      .setFontColor("#e0e0f0")
      .setFontWeight("bold");

    results.forEach((ch, i) => {
      const row = i + 2;
      sheet.getRange(row, 1).setValue(ch.title);
      sheet.getRange(row, 2).setValue(ch.ageDays + "日");
      sheet.getRange(row, 3).setValue(ch.subs).setNumberFormat("#,##0");
      sheet.getRange(row, 4).setValue(ch.buzzIndex).setNumberFormat("0.00");
      sheet.getRange(row, 5).setValue(ch.avgViews).setNumberFormat("#,##0");
      sheet.getRange(row, 6).setValue(ch.publishedAt);
      sheet.getRange(row, 7).setFormula(
        `=HYPERLINK("https://www.youtube.com/channel/${ch.id}", "開く")`
      );
      if (row % 2 === 0) {
        sheet.getRange(row, 1, 1, headers.length).setBackground("#f8f9fa");
      }
    });

    sheet.setColumnWidth(1, 200);
    sheet.autoResizeColumns(2, 6);
    ui.alert(`✅ 完了！\n「${keyword}」の急成長チャンネルを ${results.length}件 抽出しました。`);

  } catch (e) {
    ui.alert(`⚠️ エラーが発生しました: ${e.message}`);
  }
}

// ============================================================
// 検索・分析ロジック
// ============================================================
function searchGrowingChannels(keyword, apiKey) {
  const publishedAfter = new Date();
  publishedAfter.setMonth(publishedAfter.getMonth() - CONFIG.MONTHS_AGO);

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&publishedAfter=${publishedAfter.toISOString()}&maxResults=${CONFIG.MAX_RESULTS}&key=${apiKey}`;
  const searchResp = JSON.parse(UrlFetchApp.fetch(searchUrl).getContentText());
  const items = searchResp.items || [];
  if (items.length === 0) return [];

  const channelIds = [...new Set(items.map(i => i.snippet.channelId))].join(",");
  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelIds}&key=${apiKey}`;
  const statsResp = JSON.parse(UrlFetchApp.fetch(statsUrl).getContentText());

  const now = new Date();
  const results = statsResp.items.map(ch => {
    const s = ch.statistics;
    const subs = parseInt(s.subscriberCount || 0);
    const views = parseInt(s.viewCount || 0);
    const vCount = parseInt(s.videoCount || 0);
    const pubDate = new Date(ch.snippet.publishedAt);

    const ageInMs = now - pubDate;
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    const ageDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    const avgViews = vCount > 0 ? Math.round(views / vCount) : 0;

    // 分母を最低1000にすることで登録者が少ないチャンネルの異常値を防ぐ
    const buzzIndex = avgViews / Math.max(subs, CONFIG.INDEX_FLOOR);

    return {
      id: ch.id,
      title: ch.snippet.title,
      subs,
      avgViews,
      buzzIndex,
      age: ageInYears,
      ageDays,
      publishedAt: ch.snippet.publishedAt.substring(0, 10)
    };
  });

  return results
    .filter(ch => ch.subs >= CONFIG.MIN_SUBS && ch.age <= CONFIG.AGE_LIMIT)
    .sort((a, b) => b.buzzIndex - a.buzzIndex);
}

// ============================================================
// メニュー追加（スプレッドシートを開いたとき自動実行）
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu("🌌 YouTubeリサーチ")
    .addItem("▶ 急成長チャンネル検索", "findGrowingChannels")
    .addSeparator()
    .addItem("🔑 APIキー登録", "setApiKey")
    .addToUi();
}
