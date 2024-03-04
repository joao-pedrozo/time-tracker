// interface SitesData {
//   [hostname: string]: number;
// }

// const sitesData: SitesData = {};

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.get(activeInfo.tabId, (tab) => {
//     try {
//       const url = tab?.url ? new URL(tab.url) : null;

//       if (url) {
//         const hostname = url.hostname;

//         if (!sitesData[hostname]) {
//           sitesData[hostname] = 0;
//         }

//         chrome.storage.local.set({ sitesData });
//       } else {
//         console.error("Invalid URL:", tab?.url);
//       }
//     } catch (error) {
//       console.error("Error processing URL:", tab?.url, error);
//     }
//   });
// });

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.get("sitesData", (data) => {
//     if (data && data.sitesData) {
//       Object.assign(sitesData, data.sitesData);
//     }
//   });
// });

setInterval(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0] || !tabs[0].url) {
      return;
    }

    const url = tabs[0].url;
    const domain = url.split("/")?.[2];

    chrome.storage.local.get("sitesData", (data) => {
      if (!data?.sitesData) {
        chrome.storage.local.set({
          sitesData: [
            {
              url: domain,
              lastRecorded: new Date(),
              timeSpent: 1000,
            },
          ],
        });
        return;
      }

      console.log(222);

      if (data.sitesData.find((site) => site.url === domain)) {
        const newWebsites = data.sitesData.map((site) => {
          if (site.url === domain) {
            return {
              ...site,
              timeSpent: site.timeSpent + 1000,
            };
          }
          return site;
        });
        chrome.storage.local.set({
          sitesData: newWebsites,
        });
      } else {
        chrome.storage.local.set({
          sitesData: [
            ...data.sitesData,
            {
              url: domain,
              lastRecorded: new Date(),
              timeSpent: 0,
            },
          ],
        });
      }
    });
  });
}, 1000);
