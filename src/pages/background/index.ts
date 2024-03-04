interface SitesData {
  [hostname: string]: number;
}

const sitesData: SitesData = {};

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    try {
      const url = tab?.url ? new URL(tab.url) : null;

      if (url) {
        const hostname = url.hostname;

        if (!sitesData[hostname]) {
          sitesData[hostname] = 0;
        }

        chrome.storage.local.set({ sitesData });
      } else {
        console.error("Invalid URL:", tab?.url);
      }
    } catch (error) {
      console.error("Error processing URL:", tab?.url, error);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("sitesData", (data) => {
    if (data && data.sitesData) {
      Object.assign(sitesData, data.sitesData);
    }
  });
});
