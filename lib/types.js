/**
 * 型定義（JSDoc）
 */

/**
 * メディアアイテム
 * @typedef {Object} MediaItem
 * @property {string} id - ULID
 * @property {'video'|'audio'} type - メディアタイプ
 * @property {string} url - メディアURL
 * @property {string} filename - ファイル名
 * @property {'detected'|'converting'|'completed'|'error'} status - ステータス
 * @property {number} [progress] - 進捗（0-100）
 * @property {Metadata} [metadata] - メタデータ
 */

/**
 * メタデータ
 * @typedef {Object} Metadata
 * @property {string} [title] - タイトル
 * @property {string} [artist] - アーティスト
 * @property {string} [album] - アルバム
 * @property {string} [year] - 年
 * @property {string} [genre] - ジャンル
 * @property {string} [comment] - コメント
 */

/**
 * ジョブ
 * @typedef {Object} Job
 * @property {string} id - ジョブID
 * @property {string} mediaItemId - メディアアイテムID
 * @property {'pending'|'processing'|'completed'|'error'} status - ステータス
 * @property {number} progress - 進捗（0-100）
 * @property {string} [error] - エラーメッセージ
 * @property {number} startedAt - 開始時刻（UNIX時間）
 * @property {number} [completedAt] - 完了時刻（UNIX時間）
 */

export {};
