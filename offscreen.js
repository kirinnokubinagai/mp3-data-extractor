/**
 * Offscreen Document
 * ffmpeg.wasmを実行する専用環境
 * Service WorkerではURL.createObjectURLが使えないため、Offscreen Documentで処理
 */

import { extractAudioToMP3, embedMetadata } from './lib/ffmpeg.js';

console.log('[Offscreen] 初期化完了');

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Offscreen] メッセージ受信:', message.type);

  if (message.type === 'EXTRACT_AUDIO_OFFSCREEN') {
    handleExtractAudio(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 非同期レスポンス
  }
});

/**
 * 音声抽出処理（ダウンロードまで完結）
 */
async function handleExtractAudio(payload) {
  const { jobId, url, filename, metadata, bitrate = '192k' } = payload;

  console.log('[Offscreen] 音声抽出開始:', jobId);

  try {
    // プログレスコールバック
    const onProgress = async (progress) => {
      // Background Service Workerに進捗を通知
      try {
        await chrome.runtime.sendMessage({
          type: 'OFFSCREEN_PROGRESS',
          payload: { jobId, progress }
        });
      } catch (error) {
        console.warn('[Offscreen] プログレス通知エラー:', error);
      }
    };

    // 音声抽出
    console.log('[Offscreen] FFmpeg実行中...');
    let mp3Blob = await extractAudioToMP3(url, {
      outputFilename: filename.replace(/\.[^.]+$/, '.mp3'),
      bitrate,
      onProgress
    });

    // メタデータ埋め込み
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('[Offscreen] メタデータ埋め込み中...');
      mp3Blob = await embedMetadata(mp3Blob, metadata);
    }

    // Blob URLを作成（Offscreen DocumentではURL.createObjectURLが使える）
    const blobUrl = URL.createObjectURL(mp3Blob);

    // ファイル名
    const outputFilename = metadata?.title
      ? `${metadata.artist ? `${metadata.artist} - ` : ''}${metadata.title}.mp3`
      : filename.replace(/\.[^.]+$/, '.mp3');

    // ダウンロード（Offscreen Documentからも呼べる）
    const downloadId = await chrome.downloads.download({
      url: blobUrl,
      filename: outputFilename,
      saveAs: false
    });

    console.log('[Offscreen] ダウンロード開始:', downloadId);
    console.log('[Offscreen] 音声抽出完了:', jobId);

    return {
      jobId,
      downloadId,
      filename: outputFilename
    };
  } catch (error) {
    console.error('[Offscreen] 音声抽出エラー:', error);
    throw error;
  }
}
