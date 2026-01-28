/**
 * Content Script
 * ページ内の動画・音声ファイルを検出する
 */

console.log('[Content Script] 読み込み完了:', location.href);

/**
 * メディアファイルを検出
 */
function detectMedia() {
  const mediaItems = [];

  // <video> タグ
  document.querySelectorAll('video').forEach((video, index) => {
    const src = video.src || video.currentSrc;
    if (src && !src.startsWith('blob:')) {
      mediaItems.push({
        type: 'video',
        url: src,
        element: 'video',
        index: index
      });
    }
  });

  // <audio> タグ
  document.querySelectorAll('audio').forEach((audio, index) => {
    const src = audio.src || audio.currentSrc;
    if (src && !src.startsWith('blob:')) {
      mediaItems.push({
        type: 'audio',
        url: src,
        element: 'audio',
        index: index
      });
    }
  });

  // <a> タグ（mp3, mp4, webm, etc.）
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.href;
    const ext = href.split('.').pop().split('?')[0].toLowerCase();

    if (['mp3', 'mp4', 'webm', 'ogg', 'wav', 'm4a'].includes(ext)) {
      mediaItems.push({
        type: ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a' ? 'audio' : 'video',
        url: href,
        element: 'link',
        text: link.textContent.trim()
      });
    }
  });

  console.log('[Content Script] メディア検出:', mediaItems.length, '件');
  return mediaItems;
}

// メッセージ受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_REQUEST') {
    const mediaItems = detectMedia();
    sendResponse({ success: true, data: mediaItems });
  }

  return true;
});

// 初回検出
setTimeout(() => {
  const mediaItems = detectMedia();
  if (mediaItems.length > 0) {
    // Badgeに件数表示
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      payload: { count: mediaItems.length }
    });
  }
}, 1000);
