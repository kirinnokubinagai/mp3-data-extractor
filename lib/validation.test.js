/**
 * メタデータバリデーションテスト
 * タスク42: メタデータバリデーションテスト
 */
import { describe, it, expect } from 'vitest';
import { validateMetadata } from './validation.js';

describe('メタデータバリデーション', () => {
  describe('正常系', () => {
    it('有効なメタデータを受け入れること', () => {
      // Arrange
      const metadata = {
        title: 'テスト曲',
        artist: 'テストアーティスト',
        album: 'テストアルバム',
        year: '2024',
        genre: 'Pop',
        comment: 'テストコメント'
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('一部のフィールドのみでも有効とすること', () => {
      // Arrange
      const metadata = {
        title: 'テスト曲',
        artist: 'テストアーティスト'
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('空のメタデータを受け入れること', () => {
      // Arrange
      const metadata = {};

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('タイトルバリデーション', () => {
    it('タイトルが文字列でない場合エラーになること', () => {
      // Arrange
      const metadata = {
        title: 123
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.title).toBe('タイトルは文字列で入力してください');
    });

    it('タイトルが200文字を超える場合エラーになること', () => {
      // Arrange
      const metadata = {
        title: 'a'.repeat(201)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.title).toBe('タイトルは200文字以内で入力してください');
    });

    it('タイトルが200文字以内の場合は有効とすること', () => {
      // Arrange
      const metadata = {
        title: 'a'.repeat(200)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('アーティストバリデーション', () => {
    it('アーティスト名が文字列でない場合エラーになること', () => {
      // Arrange
      const metadata = {
        artist: 123
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.artist).toBe('アーティスト名は文字列で入力してください');
    });

    it('アーティスト名が200文字を超える場合エラーになること', () => {
      // Arrange
      const metadata = {
        artist: 'a'.repeat(201)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.artist).toBe('アーティスト名は200文字以内で入力してください');
    });
  });

  describe('年バリデーション', () => {
    it('年が4桁の数字でない場合エラーになること', () => {
      // Arrange
      const metadata = {
        year: '24'
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.year).toBe('年は4桁の数字で入力してください（例: 2024）');
    });

    it('年が文字列でない場合エラーになること', () => {
      // Arrange
      const metadata = {
        year: 2024
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.year).toBe('年は文字列で入力してください');
    });

    it('年が4桁の数字の場合は有効とすること', () => {
      // Arrange
      const metadata = {
        year: '2024'
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('ジャンルバリデーション', () => {
    it('ジャンルが100文字を超える場合エラーになること', () => {
      // Arrange
      const metadata = {
        genre: 'a'.repeat(101)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.genre).toBe('ジャンルは100文字以内で入力してください');
    });
  });

  describe('コメントバリデーション', () => {
    it('コメントが500文字を超える場合エラーになること', () => {
      // Arrange
      const metadata = {
        comment: 'a'.repeat(501)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.comment).toBe('コメントは500文字以内で入力してください');
    });

    it('コメントが500文字以内の場合は有効とすること', () => {
      // Arrange
      const metadata = {
        comment: 'a'.repeat(500)
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('複合エラー', () => {
    it('複数のフィールドにエラーがある場合すべて報告すること', () => {
      // Arrange
      const metadata = {
        title: 'a'.repeat(201),
        artist: 123,
        year: '24'
      };

      // Act
      const result = validateMetadata(metadata);

      // Assert
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.artist).toBeDefined();
      expect(result.errors.year).toBeDefined();
    });
  });
});
