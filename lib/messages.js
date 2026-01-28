/**
 * メッセージング
 */

/**
 * Service Workerにメッセージ送信
 * @param {string} type - メッセージタイプ
 * @param {Object} [payload] - ペイロード
 * @returns {Promise<any>}
 */
export async function sendToBackground(type, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Content Scriptにメッセージ送信
 * @param {number} tabId - タブID
 * @param {string} type - メッセージタイプ
 * @param {Object} [payload] - ペイロード
 * @returns {Promise<any>}
 */
export async function sendToContent(tabId, type, payload) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
