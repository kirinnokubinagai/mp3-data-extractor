/**
 * Service Worker (Manifest V3)
 * Offscreen Documentを管理し、音声抽出を委譲する
 */

/** 実行中のジョブ */
const activeJobs = new Map();

/** Offscreen Document作成済みフラグ */
let offscreenDocumentCreated = false;

// インストール時
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Service Worker] インストール完了', details.reason);

  if (details.reason === 'install') {
    // 初期設定
    await chrome.storage.local.set({
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
  updateBadge(0);
});

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] メッセージ受信:', message.type);

  switch (message.type) {
    case 'EXTRACT_AUDIO':
      handleExtractAudio(message.payload, sender.tab?.id)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // 非同期レスポンス

    case 'OFFSCREEN_PROGRESS':
      handleOffscreenProgress(message.payload)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'DOWNLOAD_VIDEO':
      handleDownloadVideo(message.payload)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'CANCEL_JOB':
      handleCancelJob(message.payload)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_JOBS':
      getJobs()
        .then(jobs => sendResponse({ success: true, data: jobs }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      console.warn('[Service Worker] 不明なメッセージタイプ:', message.type);
      sendResponse({ success: false, error: '不明なメッセージタイプ' });
  }
});

/**
 * Offscreen Documentを作成
 */
async function setupOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    offscreenDocumentCreated = true;
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['BLOBS'],
    justification: 'ffmpeg.wasmで音声抽出を行うため、Blob操作が必要'
  });

  offscreenDocumentCreated = true;
  console.log('[Service Worker] Offscreen Document作成完了');
}

/**
 * 音声抽出処理（Offscreen Documentに委譲）
 */
async function handleExtractAudio(payload, _tabId) {
  const { jobId, url, filename, metadata, bitrate = '192k' } = payload;

  console.log('[Service Worker] 音声抽出開始:', jobId);

  // ジョブを作成
  const job = {
    id: jobId,
    url,
    filename,
    metadata,
    status: 'converting',
    progress: 0,
    startTime: Date.now()
  };

  activeJobs.set(jobId, job);
  await saveJobToStorage(job);

  try {
    // Offscreen Documentを作成
    await setupOffscreenDocument();

    // Offscreen Documentに処理を委譲（ダウンロードまで完結）
    console.log('[Service Worker] Offscreen Documentに処理を委譲');
    const response = await chrome.runtime.sendMessage({
      type: 'EXTRACT_AUDIO_OFFSCREEN',
      payload: { jobId, url, filename, metadata, bitrate }
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    const { downloadId, filename: outputFilename } = response.data;

    console.log('[Service Worker] ダウンロード開始:', downloadId);

    // ジョブ完了
    job.status = 'completed';
    job.progress = 100;
    job.downloadId = downloadId;
    job.completedTime = Date.now();
    job.duration = job.completedTime - job.startTime;
    job.statusText = `変換完了 (${formatTime(Math.round(job.duration / 1000))})`;

    activeJobs.delete(jobId);
    await saveJobToStorage(job);

    // 完了通知
    updateBadge(activeJobs.size);

    await showNotification({
      title: '音声抽出完了',
      message: `${outputFilename} のダウンロードが完了しました`,
      icon: 'icons/icon-128.png'
    });

    // Popupに通知
    try {
      await chrome.runtime.sendMessage({
        type: 'JOB_COMPLETED',
        payload: { jobId, status: 'completed', statusText: job.statusText }
      });
    } catch {
      // Popupが閉じている場合は無視
    }

    return { jobId, status: 'completed' };
  } catch (error) {
    console.error('[Service Worker] 音声抽出エラー:', error);

    // ジョブエラー
    job.status = 'error';
    job.errorMessage = error.message;
    activeJobs.delete(jobId);
    await saveJobToStorage(job);

    // エラー通知
    await showNotification({
      title: '音声抽出エラー',
      message: `${filename}: ${error.message}`,
      icon: 'icons/icon-128.png'
    });

    // Popupに通知
    try {
      await chrome.runtime.sendMessage({
        type: 'JOB_ERROR',
        payload: { jobId, status: 'error', errorMessage: error.message }
      });
    } catch {
      // Popupが閉じている場合は無視
    }

    updateBadge(activeJobs.size);

    throw error;
  }
}

/**
 * 動画ダウンロード処理
 */
async function handleDownloadVideo(payload) {
  const { url, filename } = payload;

  const downloadId = await chrome.downloads.download({
    url: url,
    filename: filename || 'video.mp4',
    saveAs: false
  });

  console.log('[Service Worker] ダウンロード開始:', downloadId);

  await showNotification({
    title: 'ダウンロード開始',
    message: `${filename} のダウンロードを開始しました`,
    icon: 'icons/icon-128.png'
  });

  return { downloadId };
}

/**
 * ジョブキャンセル処理
 */
async function handleCancelJob(payload) {
  const { jobId } = payload;

  if (activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    job.status = 'cancelled';
    activeJobs.delete(jobId);
    await saveJobToStorage(job);

    updateBadge(activeJobs.size);

    console.log('[Service Worker] ジョブキャンセル:', jobId);
  }
}

/**
 * ジョブ一覧取得
 */
async function getJobs() {
  const result = await chrome.storage.local.get('jobs');
  return result.jobs || [];
}

/**
 * ジョブをストレージに保存
 */
async function saveJobToStorage(job) {
  const result = await chrome.storage.local.get('jobs');
  const jobs = result.jobs || [];

  const index = jobs.findIndex(j => j.id === job.id);
  if (index >= 0) {
    jobs[index] = job;
  } else {
    jobs.push(job);
  }

  await chrome.storage.local.set({ jobs });
}

/**
 * 通知を表示
 */
async function showNotification({ title, message, icon }) {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) {
    return;
  }

  await chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title,
    message,
    priority: 2
  });
}

/**
 * 設定を取得
 */
async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {
    outputFormat: 'mp3',
    bitrate: '192k',
    notificationsEnabled: true
  };
}

/**
 * Badgeを更新
 */
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#14b8a6' }); // primary-500
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Offscreen Documentからのプログレス更新を処理
 */
async function handleOffscreenProgress(payload) {
  const { jobId, progress } = payload;
  const job = activeJobs.get(jobId);

  if (!job) {
    return;
  }

  job.progress = progress;

  // 残り時間を計算
  const elapsed = Date.now() - job.startTime;
  const estimatedTotal = (elapsed / progress) * 100;
  const remaining = estimatedTotal - elapsed;
  const remainingSeconds = Math.round(remaining / 1000);

  job.remainingTime = formatTime(remainingSeconds);
  job.statusText = `変換中... ${(progress / 100).toFixed(2)}x`;

  // ストレージ更新
  await saveJobToStorage(job);

  // Popupに通知（開いていれば）
  try {
    await chrome.runtime.sendMessage({
      type: 'JOB_PROGRESS',
      payload: {
        jobId,
        progress,
        statusText: job.statusText,
        remainingTime: job.remainingTime
      }
    });
  } catch {
    // Popupが閉じている場合は無視
  }

  // Badge更新
  updateBadge(activeJobs.size);
}

/**
 * 時間フォーマット
 */
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
}

console.log('[Service Worker] 初期化完了');
