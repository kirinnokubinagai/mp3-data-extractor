/**
 * ジョブ管理
 */

/**
 * ジョブマネージャー
 */
export class JobManager {
  constructor() {
    /** 実行中のジョブ */
    this.activeJobs = new Map();
  }

  /**
   * ジョブを作成
   *
   * @param {string} jobId - ジョブID
   * @param {Object} data - ジョブデータ
   * @returns {Object} 作成されたジョブ
   */
  createJob(jobId, data) {
    const job = {
      id: jobId,
      ...data,
      status: 'converting',
      progress: 0,
      startTime: Date.now()
    };

    this.activeJobs.set(jobId, job);
    return job;
  }

  /**
   * ジョブを取得
   *
   * @param {string} jobId - ジョブID
   * @returns {Object|null} ジョブ
   */
  getJob(jobId) {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * 全ジョブを取得
   *
   * @returns {Array} ジョブ一覧
   */
  getAllJobs() {
    return Array.from(this.activeJobs.values());
  }

  /**
   * ジョブを更新
   *
   * @param {string} jobId - ジョブID
   * @param {Object} updates - 更新内容
   * @returns {Object|null} 更新後のジョブ
   */
  updateJob(jobId, updates) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return null;
    }

    Object.assign(job, updates);
    return job;
  }

  /**
   * ジョブを削除
   *
   * @param {string} jobId - ジョブID
   * @returns {boolean} 削除成功
   */
  deleteJob(jobId) {
    return this.activeJobs.delete(jobId);
  }

  /**
   * 実行中ジョブ数を取得
   *
   * @returns {number} ジョブ数
   */
  getActiveJobCount() {
    return this.activeJobs.size;
  }

  /**
   * ジョブをキャンセル
   *
   * @param {string} jobId - ジョブID
   * @returns {Object|null} キャンセルされたジョブ
   */
  cancelJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return null;
    }

    job.status = 'cancelled';
    this.activeJobs.delete(jobId);
    return job;
  }

  /**
   * ジョブを完了
   *
   * @param {string} jobId - ジョブID
   * @param {Object} result - 完了結果
   * @returns {Object|null} 完了したジョブ
   */
  completeJob(jobId, result = {}) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return null;
    }

    job.status = 'completed';
    job.progress = 100;
    job.completedTime = Date.now();
    job.duration = job.completedTime - job.startTime;
    Object.assign(job, result);

    this.activeJobs.delete(jobId);
    return job;
  }

  /**
   * ジョブをエラー状態にする
   *
   * @param {string} jobId - ジョブID
   * @param {string} errorMessage - エラーメッセージ
   * @returns {Object|null} エラー状態のジョブ
   */
  errorJob(jobId, errorMessage) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return null;
    }

    job.status = 'error';
    job.errorMessage = errorMessage;
    this.activeJobs.delete(jobId);
    return job;
  }

  /**
   * すべてのジョブをクリア
   */
  clearAll() {
    this.activeJobs.clear();
  }
}
