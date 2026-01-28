const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const rescanBtn = document.getElementById("rescan");

rescanBtn.addEventListener("click", () => {
  scanPage();
});

scanPage();

function setStatus(message) {
  statusEl.textContent = message;
}

function queryActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs[0]);
    });
  });
}

function executeCollect(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: collectMp3s,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(results && results[0] ? results[0].result : []);
      }
    );
  });
}

async function scanPage() {
  setStatus("Scanning current page…");
  listEl.innerHTML = "";

  try {
    const tab = await queryActiveTab();
    if (!tab || !tab.id) {
      setStatus("No active tab found.");
      return;
    }

    const items = await executeCollect(tab.id);
    renderItems(items || []);
  } catch (error) {
    console.error(error);
    setStatus("Failed to scan this page. Try reloading the tab.");
  }
}

function renderItems(items) {
  listEl.innerHTML = "";

  if (!items.length) {
    setStatus("No MP3 links found on this page.");
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No downloadable MP3 links detected. Try another page.";
    listEl.appendChild(empty);
    return;
  }

  setStatus(`Found ${items.length} MP3 link${items.length === 1 ? "" : "s"}.`);

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.label || "MP3 file";

    const url = document.createElement("div");
    url.className = "item-url";
    url.textContent = item.url;

    const actions = document.createElement("div");
    actions.className = "actions";

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn btn-primary";
    downloadBtn.type = "button";
    downloadBtn.textContent = "Download";
    downloadBtn.addEventListener("click", () => {
      downloadItem(item);
    });

    actions.appendChild(downloadBtn);

    li.appendChild(title);
    li.appendChild(url);
    li.appendChild(actions);

    listEl.appendChild(li);
  });
}

function downloadItem(item) {
  chrome.downloads.download({ url: item.url }, (downloadId) => {
    if (chrome.runtime.lastError) {
      setStatus(`Download failed: ${chrome.runtime.lastError.message}`);
      return;
    }
    if (downloadId) {
      setStatus(`Downloading: ${item.label || "MP3 file"}`);
    }
  });
}

function collectMp3s() {
  const results = [];
  const seen = new Set();

  const addItem = (url, label, sourceType) => {
    if (!url) return;
    const absolute = toAbsoluteUrl(url);
    if (!absolute) return;
    if (!looksLikeMp3(absolute, sourceType)) return;
    if (seen.has(absolute)) return;
    seen.add(absolute);
    results.push({
      url: absolute,
      label: label || fileNameFromUrl(absolute),
      source: sourceType || "unknown",
    });
  };

  document.querySelectorAll("audio").forEach((audio) => {
    if (audio.currentSrc) {
      addItem(audio.currentSrc, audio.getAttribute("title"), audio.type);
    } else if (audio.src) {
      addItem(audio.src, audio.getAttribute("title"), audio.type);
    }

    audio.querySelectorAll("source").forEach((source) => {
      addItem(source.src, source.getAttribute("title"), source.type);
    });
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const text = (link.textContent || "").trim();
    addItem(href, text || null, link.getAttribute("type"));
  });

  return results;

  function toAbsoluteUrl(url) {
    try {
      return new URL(url, document.baseURI).toString();
    } catch (error) {
      return null;
    }
  }

  function looksLikeMp3(url, typeHint) {
    if (!url) return false;
    if (url.startsWith("blob:")) return false;
    const lower = url.toLowerCase();
    if (lower.includes(".mp3")) return true;
    if (!typeHint) return false;
    const typeLower = typeHint.toLowerCase();
    return typeLower.includes("audio/mpeg") || typeLower.includes("mp3");
  }

  function fileNameFromUrl(url) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (!parts.length) return "MP3 file";
      return decodeURIComponent(parts[parts.length - 1]);
    } catch (error) {
      return "MP3 file";
    }
  }
}
