/**
 * ffmpeg.wasm ラッパー
 * Service Worker内で音声抽出を行う
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/** FFmpegインスタンス */
let ffmpegInstance = null;

/** 初期化済みフラグ */
let isInitialized = false;

/**
 * FFmpegを初期化
 */
export async function initFFmpeg() {
  if (isInitialized && ffmpegInstance) {
    return ffmpegInstance;
  }

  ffmpegInstance = new FFmpeg();

  // ログハンドラ
  ffmpegInstance.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  // プログレスハンドラは外部から設定する

  try {
    // CDNからffmpeg-coreをロード
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    });

    isInitialized = true;
    console.log('[FFmpeg] 初期化完了');
    return ffmpegInstance;
  } catch (error) {
    console.error('[FFmpeg] 初期化エラー:', error);
    throw error;
  }
}

/**
 * 動画から音声を抽出してMP3に変換
 * @param {string} videoUrl - 動画URL
 * @param {Object} [options] - オプション
 * @param {string} [options.outputFilename='output.mp3'] - 出力ファイル名
 * @param {string} [options.bitrate='192k'] - ビットレート
 * @param {Function} [options.onProgress] - プログレスコールバック(progress: number)
 * @returns {Promise<Blob>} - 変換後のMP3ファイル
 */
export async function extractAudioToMP3(videoUrl, options = {}) {
  const {
    outputFilename = 'output.mp3',
    bitrate = '192k',
    onProgress
  } = options;

  try {
    // FFmpeg初期化
    const ffmpeg = await initFFmpeg();

    // プログレスハンドラ設定
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        // progressは0-1の値
        onProgress(Math.round(progress * 100));
      });
    }

    // 動画ファイルをダウンロード
    console.log('[FFmpeg] 動画をダウンロード中...', videoUrl);
    const videoData = await fetchFile(videoUrl);

    // 入力ファイルとして書き込み
    const inputFilename = 'input.mp4';
    await ffmpeg.writeFile(inputFilename, videoData);

    // FFmpegコマンド実行（音声抽出 + MP3変換）
    console.log('[FFmpeg] 音声抽出開始...');
    await ffmpeg.exec([
      '-i', inputFilename,           // 入力ファイル
      '-vn',                         // 動画ストリームを無効化
      '-acodec', 'libmp3lame',       // MP3エンコーダー
      '-b:a', bitrate,               // ビットレート
      '-ar', '44100',                // サンプリングレート
      outputFilename                 // 出力ファイル
    ]);

    console.log('[FFmpeg] 変換完了');

    // 出力ファイルを読み込み
    const data = await ffmpeg.readFile(outputFilename);

    // クリーンアップ
    await ffmpeg.deleteFile(inputFilename);
    await ffmpeg.deleteFile(outputFilename);

    // Blobに変換
    const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
    return blob;
  } catch (error) {
    console.error('[FFmpeg] 変換エラー:', error);
    throw error;
  }
}

/**
 * メタデータを埋め込む
 * @param {Blob} mp3Blob - MP3ファイル
 * @param {Object} metadata - メタデータ
 * @param {string} [metadata.title] - タイトル
 * @param {string} [metadata.artist] - アーティスト
 * @param {string} [metadata.album] - アルバム
 * @param {string} [metadata.year] - 年
 * @param {string} [metadata.genre] - ジャンル
 * @param {string} [metadata.comment] - コメント
 * @returns {Promise<Blob>} - メタデータ付きMP3ファイル
 */
export async function embedMetadata(mp3Blob, metadata) {
  try {
    const ffmpeg = await initFFmpeg();

    // MP3ファイルを書き込み
    const inputFilename = 'input.mp3';
    const outputFilename = 'output.mp3';
    const arrayBuffer = await mp3Blob.arrayBuffer();
    await ffmpeg.writeFile(inputFilename, new Uint8Array(arrayBuffer));

    // メタデータコマンド構築
    const metadataArgs = [];

    if (metadata.title) {
      metadataArgs.push('-metadata', `title=${metadata.title}`);
    }
    if (metadata.artist) {
      metadataArgs.push('-metadata', `artist=${metadata.artist}`);
    }
    if (metadata.album) {
      metadataArgs.push('-metadata', `album=${metadata.album}`);
    }
    if (metadata.year) {
      metadataArgs.push('-metadata', `date=${metadata.year}`);
    }
    if (metadata.genre) {
      metadataArgs.push('-metadata', `genre=${metadata.genre}`);
    }
    if (metadata.comment) {
      metadataArgs.push('-metadata', `comment=${metadata.comment}`);
    }

    // FFmpegコマンド実行
    await ffmpeg.exec([
      '-i', inputFilename,
      ...metadataArgs,
      '-codec', 'copy',              // 再エンコードせずにメタデータのみ書き換え
      outputFilename
    ]);

    // 出力ファイルを読み込み
    const data = await ffmpeg.readFile(outputFilename);

    // クリーンアップ
    await ffmpeg.deleteFile(inputFilename);
    await ffmpeg.deleteFile(outputFilename);

    // Blobに変換
    const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
    return blob;
  } catch (error) {
    console.error('[FFmpeg] メタデータ埋め込みエラー:', error);
    throw error;
  }
}

/**
 * FFmpegインスタンスをクリーンアップ
 */
export async function cleanupFFmpeg() {
  if (ffmpegInstance) {
    // 必要に応じてリソースを解放
    ffmpegInstance = null;
    isInitialized = false;
    console.log('[FFmpeg] クリーンアップ完了');
  }
}
