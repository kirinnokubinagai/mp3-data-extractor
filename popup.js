/**
 * Media Extractor Popup
 * コンポーネントベースのUI実装 + リアルタイムプログレス表示
 */

import {
  createHeader,
  createBulkActions,
  createMediaItem,
  createEmptyState,
  createNoticeBox,
  createMetadataModal
} from './lib/components.js';

/** アプリケーション状態 */
const state = {
  mediaItems: [],
  selectedIds: new Set(),
  isScanning: false
};

/** DOM要素 */
const appEl = document.getElementById('app');

/**
 * 初期化
 */
async function init() {
  // 保存された状態を復元
  await restoreState();

  renderUI();
  await scanPage();

  // Service Workerからのメッセージをリッスン
  chrome.runtime.onMessage.addListener((message) => {
    handleServiceWorkerMessage(message);
  });

  // Lucide Icons初期化
  lucide.createIcons();
}

/**
 * 保存された状態を復元
 */
async function restoreState() {
  try {
    const result = await chrome.storage.local.get('jobs');
    const jobs = result.jobs || [];

    // 変換中のジョブがあれば状態に復元
    jobs.forEach(job => {
      if (job.status === 'converting' || job.status === 'completed') {
        const existingItem = state.mediaItems.find(item => item.id === job.id);
        if (!existingItem) {
          // ジョブからメディアアイテムを復元
          state.mediaItems.push({
            id: job.id,
            type: 'video',
            filename: job.filename,
            url: job.url,
            status: job.status,
            progress: job.progress,
            statusText: job.statusText,
            remainingTime: job.remainingTime,
            errorMessage: job.errorMessage,
            metadata: job.metadata
          });
        }
      }
    });
  } catch (error) {
    console.error('状態復元エラー:', error);
  }
}

/**
 * 状態を保存
 */
async function saveState() {
  try {
    const jobs = state.mediaItems
      .filter(item => item.status !== 'detected')
      .map(item => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        metadata: item.metadata,
        status: item.status,
        progress: item.progress,
        statusText: item.statusText,
        remainingTime: item.remainingTime,
        errorMessage: item.errorMessage,
        startTime: item.startTime
      }));

    await chrome.storage.local.set({ jobs });
  } catch (error) {
    console.error('状態保存エラー:', error);
  }
}

/**
 * Service Workerからのメッセージを処理
 */
function handleServiceWorkerMessage(message) {
  switch (message.type) {
    case 'JOB_PROGRESS':
      handleJobProgress(message.payload);
      break;
    case 'JOB_COMPLETED':
      handleJobCompleted(message.payload);
      break;
    case 'JOB_ERROR':
      handleJobError(message.payload);
      break;
  }
}

/**
 * ジョブプログレス更新
 */
function handleJobProgress(payload) {
  const { jobId, progress, statusText, remainingTime } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.progress = progress;
    item.statusText = statusText;
    item.remainingTime = remainingTime;
    renderUI();
  }
}

/**
 * ジョブ完了
 */
function handleJobCompleted(payload) {
  const { jobId, status, statusText } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.status = status;
    item.statusText = statusText;
    item.progress = 100;
    renderUI();
    saveState();
  }
}

/**
 * ジョブエラー
 */
function handleJobError(payload) {
  const { jobId, status, errorMessage } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.status = status;
    item.errorMessage = errorMessage;
    renderUI();
    saveState();
  }
}

/**
 * UIをレンダリング
 */
function renderUI() {
  appEl.innerHTML = '';

  // ヘッダー
  const header = createHeader({
    onRescan: handleRescan
  });
  appEl.appendChild(header);

  // 注意事項ボックス
  const notice = createNoticeBox({
    variant: 'warning',
    items: [
      '大容量ファイル（1GB超）の処理には10分以上かかる場合があります',
      '変換中はメモリを多く使用します。他のタブを閉じることを推奨します',
      '著作権法を遵守し、個人利用の範囲でご使用ください'
    ]
  });
  appEl.appendChild(notice);

  // メディアリスト
  if (state.mediaItems.length === 0) {
    // 空の状態
    if (!state.isScanning) {
      const emptyState = createEmptyState();
      appEl.appendChild(emptyState);
    }
  } else {
    // 一括操作バー
    const bulkActions = createBulkActions({
      selectAllChecked: state.selectedIds.size === state.mediaItems.length,
      onSelectAll: handleSelectAll,
      onBulkDownload: handleBulkDownload,
      onBulkExtract: handleBulkExtract
    });
    appEl.appendChild(bulkActions);

    // メディアアイテムリスト
    const listContainer = document.createElement('div');
    listContainer.className = 'p-4 space-y-4';

    state.mediaItems.forEach(item => {
      const mediaItem = createMediaItem({
        id: item.id,
        type: item.type,
        filename: item.filename,
        url: item.url,
        status: item.status || 'detected',
        progress: item.progress,
        statusText: item.statusText,
        remainingTime: item.remainingTime,
        errorMessage: item.errorMessage,
        checked: state.selectedIds.has(item.id),
        onCheckChange: () => handleCheckChange(item.id),
        onEdit: () => handleEdit(item.id),
        onDownload: () => handleDownload(item.id),
        onExtract: () => handleExtract(item.id),
        onCancel: () => handleCancel(item.id),
        onRetry: () => handleRetry(item.id),
        onDelete: () => handleDelete(item.id)
      });
      listContainer.appendChild(mediaItem);
    });

    appEl.appendChild(listContainer);
  }

  // Lucide Icons初期化
  lucide.createIcons();
}

/**
 * ページをスキャンしてメディアを検出
 */
async function scanPage() {
  state.isScanning = true;
  renderUI();

  try {
    const tab = await queryActiveTab();
    if (!tab || !tab.id) {
      console.error('No active tab found');
      state.isScanning = false;
      renderUI();
      return;
    }

    // Content Scriptを実行してメディアを検出
    const results = await executeCollect(tab.id);

    // 既存の検出済みアイテムをクリア（変換中・完了は保持）
    state.mediaItems = state.mediaItems.filter(
      item => item.status !== 'detected'
    );

    // 新しい検出結果を追加
    results.forEach((item, index) => {
      state.mediaItems.push({
        id: `media-${Date.now()}-${index}`,
        type: detectMediaType(item.url, item.source),
        filename: item.label || extractFilename(item.url),
        url: item.url,
        status: 'detected'
      });
    });

    state.selectedIds.clear();
  } catch (error) {
    console.error('Failed to scan page:', error);
  } finally {
    state.isScanning = false;
    renderUI();
  }
}

/**
 * アクティブなタブを取得
 */
function queryActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs[0]);
    });
  });
}

/**
 * Content Scriptを実行してメディアを収集
 */
function executeCollect(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: collectMedia
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(results && results[0] ? results[0].result : []);
      }
    );
  });
}

/**
 * メディア検出関数（Content Script内で実行される）
 */
function collectMedia() {
  const results = [];
  const seen = new Set();

  const addItem = (url, label, sourceType) => {
    if (!url) {
      return;
    }
    const absolute = toAbsoluteUrl(url);
    if (!absolute) {
      return;
    }
    if (!looksLikeMedia(absolute, sourceType)) {
      return;
    }
    if (seen.has(absolute)) {
      return;
    }
    seen.add(absolute);
    results.push({
      url: absolute,
      label: label || fileNameFromUrl(absolute),
      source: sourceType || 'unknown'
    });
  };

  // <video>タグ検出
  document.querySelectorAll('video').forEach((video) => {
    if (video.currentSrc) {
      addItem(video.currentSrc, video.getAttribute('title'), 'video/mp4');
    } else if (video.src) {
      addItem(video.src, video.getAttribute('title'), 'video/mp4');
    }

    video.querySelectorAll('source').forEach((source) => {
      addItem(source.src, source.getAttribute('title'), source.type);
    });
  });

  // <audio>タグ検出
  document.querySelectorAll('audio').forEach((audio) => {
    if (audio.currentSrc) {
      addItem(audio.currentSrc, audio.getAttribute('title'), audio.type);
    } else if (audio.src) {
      addItem(audio.src, audio.getAttribute('title'), audio.type);
    }

    audio.querySelectorAll('source').forEach((source) => {
      addItem(source.src, source.getAttribute('title'), source.type);
    });
  });

  // <a>タグ検出（動画・音声ファイルへのリンク）
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const text = (link.textContent || '').trim();
    addItem(href, text || null, link.getAttribute('type'));
  });

  return results;

  function toAbsoluteUrl(url) {
    try {
      return new URL(url, document.baseURI).toString();
    } catch {
      return null;
    }
  }

  function looksLikeMedia(url, typeHint) {
    if (!url) {
      return false;
    }
    if (url.startsWith('blob:')) {
      return false;
    }

    const lower = url.toLowerCase();

    // 動画拡張子
    const videoExts = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.m4v'];
    if (videoExts.some(ext => lower.includes(ext))) {
      return true;
    }

    // 音声拡張子
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'];
    if (audioExts.some(ext => lower.includes(ext))) {
      return true;
    }

    // MIMEタイプチェック
    if (typeHint) {
      const typeLower = typeHint.toLowerCase();
      if (typeLower.includes('video/') || typeLower.includes('audio/')) {
        return true;
      }
    }

    return false;
  }

  function fileNameFromUrl(url) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (!parts.length) {
        return 'メディアファイル';
      }
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return 'メディアファイル';
    }
  }
}

/**
 * メディアタイプを判定
 */
function detectMediaType(url, source) {
  const lower = url.toLowerCase();

  const videoExts = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.m4v'];
  if (videoExts.some(ext => lower.includes(ext))) {
    return 'video';
  }

  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'];
  if (audioExts.some(ext => lower.includes(ext))) {
    return 'audio';
  }

  if (source) {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('video/')) {
      return 'video';
    }
    if (sourceLower.includes('audio/')) {
      return 'audio';
    }
  }

  return 'video'; // デフォルト
}

/**
 * ファイル名を抽出
 */
function extractFilename(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (!parts.length) {
      return 'メディアファイル';
    }
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return 'メディアファイル';
  }
}

/**
 * イベントハンドラ群
 */

function handleRescan() {
  scanPage();
}

function handleSelectAll(e) {
  if (e.target.checked) {
    state.mediaItems.forEach(item => state.selectedIds.add(item.id));
  } else {
    state.selectedIds.clear();
  }
  renderUI();
}

function handleCheckChange(id) {
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
  } else {
    state.selectedIds.add(id);
  }
  renderUI();
}

async function handleBulkDownload() {
  const selectedItems = state.mediaItems.filter(
    item => state.selectedIds.has(item.id) && item.status === 'detected'
  );

  if (selectedItems.length === 0) {
    return;
  }

  for (const item of selectedItems) {
    try {
      await chrome.runtime.sendMessage({
        type: 'DOWNLOAD_VIDEO',
        payload: {
          url: item.url,
          filename: item.filename
        }
      });
    } catch (error) {
      console.error('一括ダウンロードエラー:', error);
    }
  }
}

async function handleBulkExtract() {
  const selectedItems = state.mediaItems.filter(
    item => state.selectedIds.has(item.id) && item.status === 'detected'
  );

  if (selectedItems.length === 0) {
    return;
  }

  for (const item of selectedItems) {
    await startExtraction(item);
  }
}

function handleEdit(id) {
  const item = state.mediaItems.find(i => i.id === id);
  if (!item) {
    return;
  }

  // メタデータモーダルを表示
  const modal = createMetadataModal({
    metadata: item.metadata || {},
    onClose: () => {
      document.body.removeChild(modal);
    },
    onSave: (metadata) => {
      item.metadata = metadata;
      document.body.removeChild(modal);
      renderUI();
    }
  });

  document.body.appendChild(modal);
  lucide.createIcons();
}

async function handleDownload(id) {
  const item = state.mediaItems.find(i => i.id === id);
  if (!item) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      type: 'DOWNLOAD_VIDEO',
      payload: {
        url: item.url,
        filename: item.filename
      }
    });
  } catch (error) {
    console.error('ダウンロードエラー:', error);
    item.status = 'error';
    item.errorMessage = error.message;
    renderUI();
  }
}

async function handleExtract(id) {
  const item = state.mediaItems.find(i => i.id === id);
  if (!item) {
    return;
  }

  await startExtraction(item);
}

async function startExtraction(item) {
  // 状態を変換中に変更
  item.status = 'converting';
  item.progress = 0;
  item.statusText = '変換準備中...';
  item.startTime = Date.now();
  renderUI();
  await saveState();

  try {
    // Service Workerに音声抽出を依頼
    const response = await chrome.runtime.sendMessage({
      type: 'EXTRACT_AUDIO',
      payload: {
        jobId: item.id,
        url: item.url,
        filename: item.filename,
        metadata: item.metadata
      }
    });

    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('音声抽出エラー:', error);
    item.status = 'error';
    item.errorMessage = error.message;
    renderUI();
    await saveState();
  }
}

async function handleCancel(id) {
  const item = state.mediaItems.find(i => i.id === id);
  if (!item) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      type: 'CANCEL_JOB',
      payload: { jobId: id }
    });

    item.status = 'detected';
    item.progress = undefined;
    item.statusText = undefined;
    item.remainingTime = undefined;
    renderUI();
    await saveState();
  } catch (error) {
    console.error('キャンセルエラー:', error);
  }
}

async function handleRetry(id) {
  const item = state.mediaItems.find(i => i.id === id);
  if (!item) {
    return;
  }

  item.status = 'detected';
  item.errorMessage = undefined;
  renderUI();
  await saveState();
}

async function handleDelete(id) {
  const index = state.mediaItems.findIndex(i => i.id === id);
  if (index === -1) {
    return;
  }

  state.mediaItems.splice(index, 1);
  state.selectedIds.delete(id);
  renderUI();
  await saveState();
}

// 初期化実行
init();
