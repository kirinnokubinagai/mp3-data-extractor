/**
 * エラーハンドリング
 */

/**
 * エラー種別
 */
export const ErrorType = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  FFMPEG: 'ffmpeg',
  STORAGE: 'storage',
  UNKNOWN: 'unknown'
};

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  /**
   * @param {string} type - エラー種別
   * @param {string} message - エラーメッセージ
   * @param {Error} [originalError] - 元のエラー
   */
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * エラーメッセージをユーザーフレンドリーに変換
 *
 * @param {Error} error - エラー
 * @returns {string} ユーザー向けメッセージ
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof AppError) {
    return error.message;
  }

  // ネットワークエラー
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }

  // CORS エラー
  if (error.message.includes('CORS')) {
    return 'このファイルはダウンロードできません。サイトの制限により、アクセスが拒否されました。';
  }

  // ファイルサイズエラー
  if (error.message.includes('size') || error.message.includes('large')) {
    return 'ファイルサイズが大きすぎます。小さいファイルをお試しください。';
  }

  // FFmpegエラー
  if (error.message.includes('ffmpeg') || error.message.includes('wasm')) {
    return '音声変換中にエラーが発生しました。もう一度お試しください。';
  }

  // ストレージエラー
  if (error.message.includes('storage') || error.message.includes('quota')) {
    return 'ストレージ容量が不足しています。不要なファイルを削除してください。';
  }

  // 汎用エラー
  return 'エラーが発生しました。もう一度お試しください。';
}

/**
 * エラーをログに記録
 *
 * @param {Error} error - エラー
 * @param {Object} [context] - コンテキスト情報
 */
export function logError(error, context = {}) {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };

  console.error('[Error]', errorInfo);

  // 本番環境ではエラートラッキングサービスに送信
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(errorInfo);
  // }
}

/**
 * エラーをリトライ可能か判定
 *
 * @param {Error} error - エラー
 * @returns {boolean} リトライ可能かどうか
 */
export function isRetryableError(error) {
  if (error instanceof AppError) {
    return [ErrorType.NETWORK, ErrorType.FFMPEG].includes(error.type);
  }

  // ネットワークエラーはリトライ可能
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return true;
  }

  // タイムアウトエラーはリトライ可能
  if (error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * リトライ処理
 *
 * @param {Function} fn - 実行する関数
 * @param {number} [maxRetries=3] - 最大リトライ回数
 * @param {number} [delay=1000] - リトライ間隔（ミリ秒）
 * @returns {Promise<any>} 実行結果
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logError(error, { attempt: i + 1, maxRetries });

      if (!isRetryableError(error)) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
