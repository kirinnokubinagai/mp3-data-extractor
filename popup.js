/**
 * Media Extractor Popup
 * コンポーネントベースのUI実装 + リアルタイムプログレス表示
 */

import {
  createHeader,
  createMediaItem,
  createEmptyState,
  createNoticeBox,
  createMetadataModal
} from './lib/components.js';

/** アプリケーション状態 */
const state = {
  mediaItems: [],
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
    case 'YOUTUBE_PROGRESS':
      handleYouTubeProgress(message.payload);
      break;
    case 'YOUTUBE_METADATA':
      handleYouTubeMetadata(message.payload);
      break;
    case 'YOUTUBE_STATUS':
      handleYouTubeStatus(message.payload);
      break;
    case 'YOUTUBE_COMPLETE':
      handleYouTubeComplete(message.payload);
      break;
    case 'YOUTUBE_ERROR':
      handleYouTubeError(message.payload);
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
 * yt-dlp進捗更新
 */
function handleYouTubeProgress(payload) {
  const { jobId, progress, message } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.progress = progress;
    item.statusText = message;
    renderUI();
  }
}

/**
 * yt-dlpメタデータ受信
 */
function handleYouTubeMetadata(payload) {
  const { jobId, metadata } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.metadata = metadata;
    renderUI();
  }
}

/**
 * yt-dlpステータス更新
 */
function handleYouTubeStatus(payload) {
  const { jobId, message } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.statusText = message;
    renderUI();
  }
}

/**
 * yt-dlp完了
 */
function handleYouTubeComplete(payload) {
  const { jobId, metadata } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.status = 'completed';
    item.progress = 100;
    item.statusText = 'ダウンロード完了';
    if (metadata) {
      item.metadata = metadata;
    }
    renderUI();
    saveState();
  }
}

/**
 * yt-dlpエラー
 */
function handleYouTubeError(payload) {
  const { jobId, error } = payload;
  const item = state.mediaItems.find(i => i.id === jobId);

  if (item) {
    item.status = 'error';
    item.errorMessage = error;
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
        metadata: item.metadata,
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
    console.log('[scanPage] 検出結果を受信:', results.length, '件');

    // 既存の検出済みアイテムをクリア（変換中・完了は保持）
    state.mediaItems = state.mediaItems.filter(
      item => item.status !== 'detected'
    );

    // 新しい検出結果を追加
    results.forEach((item, index) => {
      console.log('[scanPage] アイテム追加:', item);
      state.mediaItems.push({
        id: `media-${Date.now()}-${index}`,
        type: detectMediaType(item.url, item.source),
        filename: item.label || extractFilename(item.url),
        url: item.url,
        status: 'detected',
        isYoutube: item.isYoutube || false
      });
    });

    console.log('[scanPage] state.mediaItems:', state.mediaItems.length, '件');

  } catch (error) {
    console.error('[scanPage] エラー:', error);
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
    console.log('[executeCollect] タブID:', tabId);

    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: collectMedia
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error('[executeCollect] エラー:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const collectedItems = results && results[0] ? results[0].result : [];
        console.log('[executeCollect] 受信結果:', collectedItems.length, '件', collectedItems);
        resolve(collectedItems);
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

  // YouTube検出
  const isYoutube = window.location.hostname.includes('youtube.com') ||
                   window.location.hostname.includes('youtu.be');

  if (isYoutube) {
    console.log('[collectMedia] YouTube検出 - yt-dlpを使用します');

    // YouTubeの動画URLを返す（yt-dlpで処理）
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (videoId) {
      const youtubeUrl = window.location.href;
      results.push({
        url: youtubeUrl,
        label: document.title.replace(' - YouTube', ''),
        source: 'youtube',
        isYoutube: true
      });
      console.log('[collectMedia] YouTube URL:', youtubeUrl);
      return results;
    }
  }

  const addItem = (url, label, sourceType, isFromMediaElement = false) => {
    if (!url) {
      return;
    }
    const absolute = toAbsoluteUrl(url);
    if (!absolute) {
      return;
    }
    // blob: URLのチェック
    if (absolute.startsWith('blob:')) {
      console.log('[collectMedia] blob: URLをスキップ:', absolute);
      return;
    }
    // video/audio要素から取得した場合は拡張子チェックをスキップ
    if (!isFromMediaElement && !looksLikeMedia(absolute, sourceType)) {
      return;
    }
    if (seen.has(absolute)) {
      return;
    }
    console.log('[collectMedia] メディア追加:', absolute);
    seen.add(absolute);
    results.push({
      url: absolute,
      label: label || fileNameFromUrl(absolute),
      source: sourceType || 'unknown'
    });
  };

  // <video>タグ検出
  console.log('[collectMedia] video要素数:', document.querySelectorAll('video').length);
  document.querySelectorAll('video').forEach((video, idx) => {
    console.log(`[collectMedia] video[${idx}]:`, {
      src: video.src,
      currentSrc: video.currentSrc,
      title: video.getAttribute('title')
    });

    if (video.currentSrc) {
      addItem(video.currentSrc, video.getAttribute('title'), 'video/mp4', true);
    } else if (video.src) {
      addItem(video.src, video.getAttribute('title'), 'video/mp4', true);
    }

    video.querySelectorAll('source').forEach((source) => {
      addItem(source.src, source.getAttribute('title'), source.type, true);
    });
  });

  // <audio>タグ検出
  document.querySelectorAll('audio').forEach((audio) => {
    if (audio.currentSrc) {
      addItem(audio.currentSrc, audio.getAttribute('title'), audio.type, true);
    } else if (audio.src) {
      addItem(audio.src, audio.getAttribute('title'), audio.type, true);
    }

    audio.querySelectorAll('source').forEach((source) => {
      addItem(source.src, source.getAttribute('title'), source.type, true);
    });
  });

  // <a>タグ検出（動画・音声ファイルへのリンク）
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const text = (link.textContent || '').trim();
    addItem(href, text || null, link.getAttribute('type'));
  });

  console.log('[collectMedia] 検出結果:', results.length, '件', results);
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
    // YouTubeの場合はytdl-coreを使用
    if (item.isYoutube) {
      item.status = 'converting';
      item.statusText = 'YouTubeダウンロード中...';
      item.progress = 0;
      renderUI();

      const response = await chrome.runtime.sendMessage({
        type: 'YOUTUBE_DOWNLOAD',
        payload: {
          url: item.url,
          jobId: id
        }
      });

      if (response.success) {
        item.status = 'completed';
        item.statusText = 'ダウンロード完了';
        item.progress = 100;
      } else {
        throw new Error(response.error);
      }
    } else {
      // 通常のダウンロード
      await chrome.runtime.sendMessage({
        type: 'DOWNLOAD_VIDEO',
        payload: {
          url: item.url,
          filename: item.filename
        }
      });
    }

    renderUI();
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

  // YouTubeの場合はytdl-coreで音声抽出
  if (item.isYoutube) {
    try {
      item.status = 'converting';
      item.statusText = 'YouTube音声抽出中...';
      item.progress = 0;
      renderUI();

      const response = await chrome.runtime.sendMessage({
        type: 'YOUTUBE_EXTRACT',
        payload: {
          url: item.url,
          jobId: id
        }
      });

      if (response.success) {
        item.status = 'completed';
        item.statusText = '音声抽出完了';
        item.progress = 100;
      } else {
        throw new Error(response.error);
      }

      renderUI();
    } catch (error) {
      console.error('音声抽出エラー:', error);
      item.status = 'error';
      item.errorMessage = error.message;
      renderUI();
    }
  } else {
    // 通常のffmpeg抽出
    await startExtraction(item);
  }
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
  renderUI();
  await saveState();
}

// 初期化実行
init();
