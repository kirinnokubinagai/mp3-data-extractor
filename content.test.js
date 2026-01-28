/**
 * メディア検出ロジックテスト
 * タスク41: メディア検出ロジックテスト
 */
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * メディアファイルを検出（content.jsから抽出）
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
        type:
          ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a'
            ? 'audio'
            : 'video',
        url: href,
        element: 'link',
        text: link.textContent.trim()
      });
    }
  });

  return mediaItems;
}

describe('メディア検出ロジック', () => {
  beforeEach(() => {
    // DOMをクリア
    document.body.innerHTML = '';
  });

  describe('video要素の検出', () => {
    it('video要素から動画URLを検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <video src="https://example.com/video.mp4"></video>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'video',
        url: 'https://example.com/video.mp4',
        element: 'video',
        index: 0
      });
    });

    it('blob URLは除外すること', () => {
      // Arrange
      document.body.innerHTML = `
        <video src="blob:https://example.com/123"></video>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('複数のvideo要素を検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <video src="https://example.com/video1.mp4"></video>
        <video src="https://example.com/video2.mp4"></video>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].index).toBe(0);
      expect(result[1].index).toBe(1);
    });
  });

  describe('audio要素の検出', () => {
    it('audio要素から音声URLを検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <audio src="https://example.com/audio.mp3"></audio>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'audio',
        url: 'https://example.com/audio.mp3',
        element: 'audio',
        index: 0
      });
    });
  });

  describe('リンク要素の検出', () => {
    it('mp3リンクを検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <a href="https://example.com/song.mp3">Download MP3</a>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'audio',
        url: 'https://example.com/song.mp3',
        element: 'link',
        text: 'Download MP3'
      });
    });

    it('mp4リンクを検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <a href="https://example.com/video.mp4">Download Video</a>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'video',
        url: 'https://example.com/video.mp4',
        element: 'link'
      });
    });

    it('対応拡張子のみを検出すること', () => {
      // Arrange
      document.body.innerHTML = `
        <a href="https://example.com/file.mp3">MP3</a>
        <a href="https://example.com/file.mp4">MP4</a>
        <a href="https://example.com/file.pdf">PDF</a>
        <a href="https://example.com/file.txt">TXT</a>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].url).toContain('.mp3');
      expect(result[1].url).toContain('.mp4');
    });

    it('クエリパラメータ付きURLを正しく処理すること', () => {
      // Arrange
      document.body.innerHTML = `
        <a href="https://example.com/file.mp3?token=abc123">Download</a>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('audio');
    });
  });

  describe('複合検出', () => {
    it('video、audio、linkを同時に検出できること', () => {
      // Arrange
      document.body.innerHTML = `
        <video src="https://example.com/video.mp4"></video>
        <audio src="https://example.com/audio.mp3"></audio>
        <a href="https://example.com/song.mp3">Download</a>
      `;

      // Act
      const result = detectMedia();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].element).toBe('video');
      expect(result[1].element).toBe('audio');
      expect(result[2].element).toBe('link');
    });
  });
});
