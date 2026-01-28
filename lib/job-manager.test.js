/**
 * ジョブ管理テスト
 * タスク43: ジョブ管理テスト
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JobManager } from './job-manager.js';

describe('JobManager', () => {
  /** @type {JobManager} */
  let manager;

  beforeEach(() => {
    manager = new JobManager();
  });

  describe('createJob', () => {
    it('ジョブを作成できること', () => {
      // Arrange
      const jobId = 'job-001';
      const data = {
        url: 'https://example.com/video.mp4',
        filename: 'video.mp4'
      };

      // Act
      const job = manager.createJob(jobId, data);

      // Assert
      expect(job).toMatchObject({
        id: jobId,
        url: data.url,
        filename: data.filename,
        status: 'converting',
        progress: 0
      });
      expect(job.startTime).toBeGreaterThan(0);
    });

    it('作成したジョブを取得できること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const job = manager.getJob(jobId);

      // Assert
      expect(job).not.toBeNull();
      expect(job.id).toBe(jobId);
    });
  });

  describe('getJob', () => {
    it('存在するジョブを取得できること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const job = manager.getJob(jobId);

      // Assert
      expect(job).not.toBeNull();
      expect(job.id).toBe(jobId);
    });

    it('存在しないジョブの場合nullを返すこと', () => {
      // Act
      const job = manager.getJob('non-existent');

      // Assert
      expect(job).toBeNull();
    });
  });

  describe('getAllJobs', () => {
    it('すべてのジョブを取得できること', () => {
      // Arrange
      manager.createJob('job-001', { url: 'https://example.com/video1.mp4' });
      manager.createJob('job-002', { url: 'https://example.com/video2.mp4' });
      manager.createJob('job-003', { url: 'https://example.com/video3.mp4' });

      // Act
      const jobs = manager.getAllJobs();

      // Assert
      expect(jobs).toHaveLength(3);
      expect(jobs.map((j) => j.id)).toEqual(['job-001', 'job-002', 'job-003']);
    });

    it('ジョブがない場合空配列を返すこと', () => {
      // Act
      const jobs = manager.getAllJobs();

      // Assert
      expect(jobs).toEqual([]);
    });
  });

  describe('updateJob', () => {
    it('ジョブを更新できること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const updated = manager.updateJob(jobId, {
        progress: 50,
        statusText: '変換中...'
      });

      // Assert
      expect(updated).not.toBeNull();
      expect(updated.progress).toBe(50);
      expect(updated.statusText).toBe('変換中...');
    });

    it('存在しないジョブの場合nullを返すこと', () => {
      // Act
      const updated = manager.updateJob('non-existent', { progress: 50 });

      // Assert
      expect(updated).toBeNull();
    });
  });

  describe('deleteJob', () => {
    it('ジョブを削除できること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const result = manager.deleteJob(jobId);

      // Assert
      expect(result).toBe(true);
      expect(manager.getJob(jobId)).toBeNull();
    });

    it('存在しないジョブの場合falseを返すこと', () => {
      // Act
      const result = manager.deleteJob('non-existent');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getActiveJobCount', () => {
    it('実行中ジョブ数を取得できること', () => {
      // Arrange
      manager.createJob('job-001', { url: 'https://example.com/video1.mp4' });
      manager.createJob('job-002', { url: 'https://example.com/video2.mp4' });

      // Act
      const count = manager.getActiveJobCount();

      // Assert
      expect(count).toBe(2);
    });

    it('ジョブがない場合0を返すこと', () => {
      // Act
      const count = manager.getActiveJobCount();

      // Assert
      expect(count).toBe(0);
    });
  });

  describe('cancelJob', () => {
    it('ジョブをキャンセルできること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const cancelled = manager.cancelJob(jobId);

      // Assert
      expect(cancelled).not.toBeNull();
      expect(cancelled.status).toBe('cancelled');
      expect(manager.getJob(jobId)).toBeNull();
    });

    it('存在しないジョブの場合nullを返すこと', () => {
      // Act
      const cancelled = manager.cancelJob('non-existent');

      // Assert
      expect(cancelled).toBeNull();
    });
  });

  describe('completeJob', () => {
    it('ジョブを完了できること', () => {
      // Arrange
      const jobId = 'job-001';
      const startTime = Date.now();
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const completed = manager.completeJob(jobId, { downloadId: 123 });

      // Assert
      expect(completed).not.toBeNull();
      expect(completed.status).toBe('completed');
      expect(completed.progress).toBe(100);
      expect(completed.downloadId).toBe(123);
      expect(completed.completedTime).toBeGreaterThanOrEqual(startTime);
      expect(completed.duration).toBeGreaterThanOrEqual(0);
      expect(manager.getJob(jobId)).toBeNull();
    });

    it('存在しないジョブの場合nullを返すこと', () => {
      // Act
      const completed = manager.completeJob('non-existent');

      // Assert
      expect(completed).toBeNull();
    });
  });

  describe('errorJob', () => {
    it('ジョブをエラー状態にできること', () => {
      // Arrange
      const jobId = 'job-001';
      manager.createJob(jobId, { url: 'https://example.com/video.mp4' });

      // Act
      const errored = manager.errorJob(jobId, 'ファイルが見つかりません');

      // Assert
      expect(errored).not.toBeNull();
      expect(errored.status).toBe('error');
      expect(errored.errorMessage).toBe('ファイルが見つかりません');
      expect(manager.getJob(jobId)).toBeNull();
    });

    it('存在しないジョブの場合nullを返すこと', () => {
      // Act
      const errored = manager.errorJob('non-existent', 'エラー');

      // Assert
      expect(errored).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('すべてのジョブをクリアできること', () => {
      // Arrange
      manager.createJob('job-001', { url: 'https://example.com/video1.mp4' });
      manager.createJob('job-002', { url: 'https://example.com/video2.mp4' });

      // Act
      manager.clearAll();

      // Assert
      expect(manager.getActiveJobCount()).toBe(0);
      expect(manager.getAllJobs()).toEqual([]);
    });
  });
});
