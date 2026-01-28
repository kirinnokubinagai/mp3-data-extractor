/**
 * メタデータバリデーション
 */

/**
 * メタデータをバリデーション
 *
 * @param {Object} metadata - メタデータ
 * @param {string} [metadata.title] - タイトル
 * @param {string} [metadata.artist] - アーティスト
 * @param {string} [metadata.album] - アルバム
 * @param {string} [metadata.year] - 年
 * @param {string} [metadata.genre] - ジャンル
 * @param {string} [metadata.comment] - コメント
 * @returns {{valid: boolean, errors: Object}} バリデーション結果
 */
export function validateMetadata(metadata) {
  const errors = {};

  // タイトル
  if (metadata.title !== undefined) {
    if (typeof metadata.title !== 'string') {
      errors.title = 'タイトルは文字列で入力してください';
    } else if (metadata.title.length > 200) {
      errors.title = 'タイトルは200文字以内で入力してください';
    }
  }

  // アーティスト
  if (metadata.artist !== undefined) {
    if (typeof metadata.artist !== 'string') {
      errors.artist = 'アーティスト名は文字列で入力してください';
    } else if (metadata.artist.length > 200) {
      errors.artist = 'アーティスト名は200文字以内で入力してください';
    }
  }

  // アルバム
  if (metadata.album !== undefined) {
    if (typeof metadata.album !== 'string') {
      errors.album = 'アルバム名は文字列で入力してください';
    } else if (metadata.album.length > 200) {
      errors.album = 'アルバム名は200文字以内で入力してください';
    }
  }

  // 年
  if (metadata.year !== undefined) {
    if (typeof metadata.year !== 'string') {
      errors.year = '年は文字列で入力してください';
    } else if (!/^\d{4}$/.test(metadata.year)) {
      errors.year = '年は4桁の数字で入力してください（例: 2024）';
    }
  }

  // ジャンル
  if (metadata.genre !== undefined) {
    if (typeof metadata.genre !== 'string') {
      errors.genre = 'ジャンルは文字列で入力してください';
    } else if (metadata.genre.length > 100) {
      errors.genre = 'ジャンルは100文字以内で入力してください';
    }
  }

  // コメント
  if (metadata.comment !== undefined) {
    if (typeof metadata.comment !== 'string') {
      errors.comment = 'コメントは文字列で入力してください';
    } else if (metadata.comment.length > 500) {
      errors.comment = 'コメントは500文字以内で入力してください';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
