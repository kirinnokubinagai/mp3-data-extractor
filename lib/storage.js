/**
 * Chrome Storage操作
 */

/**
 * すべてのジョブを取得
 * @returns {Promise<Job[]>}
 */
export async function getAllJobs() {
  const result = await chrome.storage.local.get('jobs');
  return result.jobs || [];
}

/**
 * ジョブを保存
 * @param {Job} job
 * @returns {Promise<void>}
 */
export async function saveJob(job) {
  const jobs = await getAllJobs();
  jobs.push(job);
  await chrome.storage.local.set({ jobs });
}

/**
 * ジョブを更新
 * @param {string} jobId
 * @param {Partial<Job>} updates
 * @returns {Promise<void>}
 */
export async function updateJob(jobId, updates) {
  const jobs = await getAllJobs();
  const index = jobs.findIndex(j => j.id === jobId);

  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    await chrome.storage.local.set({ jobs });
  }
}

/**
 * ストレージをクリア
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  await chrome.storage.local.clear();
}
