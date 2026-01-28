/**
 * Service Worker (Manifest V3)
 * バックグラウンドでffmpeg.wasmを実行し、音声抽出を行う
 */

// インストール時
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] インストール完了', details.reason);

  // 初期化処理
  if (details.reason === 'install') {
    chrome.storage.local.set({
      jobs: [],
      settings: {
        outputFormat: 'mp3',
        bitrate: '192k',
        notificationsEnabled: true
      }
    });
  }
});

// 起動時
chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] 起動完了');
});

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  console.log('[Service Worker] メッセージ受信:', message);

  switch (message.type) {
    case 'SCAN_MEDIA':
      handleScanMedia(sender.tab.id);
      break;
    case 'DOWNLOAD_VIDEO':
      handleDownloadVideo(message.payload);
      break;
    case 'EXTRACT_AUDIO':
      handleExtractAudio(message.payload);
      break;
    default:
      console.warn('[Service Worker] 不明なメッセージタイプ:', message.type);
  }

  return true; // 非同期レスポンス
});

/**
 * メディアスキャン処理
 */
function handleScanMedia(tabId) {
  // Content Scriptにメディア検出を依頼
  chrome.tabs.sendMessage(tabId, { type: 'SCAN_REQUEST' });
}

/**
 * 動画ダウンロード処理
 */
function handleDownloadVideo(payload) {
  const { url, filename } = payload;

  chrome.downloads.download(
    {
      url: url,
      filename: filename || 'video.mp4',
      saveAs: true
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[Service Worker] ダウンロードエラー:', chrome.runtime.lastError);
        return;
      }

      console.log('[Service Worker] ダウンロード開始:', downloadId);

      // 通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'ダウンロード開始',
        message: `${filename} のダウンロードを開始しました`
      });
    }
  );
}

/**
 * 音声抽出処理（仮実装）
 */
async function handleExtractAudio(payload) {
  const { filename } = payload;

  console.log('[Service Worker] 音声抽出開始:', filename);

  // TODO: Phase 7でffmpeg.wasm統合
  // 現時点ではプレースホルダー

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: '音声抽出',
    message: `${filename} の音声抽出機能は後のフェーズで実装します`
  });
}

console.log('[Service Worker] 初期化完了');
