const generateSiteData = ({ url }) => {
  return {};
};

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
              lastRecorded: new Date().toDateString(),
              days: [
                {
                  date: new Date().toDateString(),
                  timeSpent: 0,
                },
              ],
            },
          ],
        });
        return;
      }

      const urlAlreadyRegistered = data.sitesData.some(
        (site: any) => site.url === domain
      );

      if (urlAlreadyRegistered) {
        const newWebsites = data.sitesData.map((site: any) => {
          const isCurrentIteration = site.url === domain;

          if (isCurrentIteration) {
            const hasSwitchedDay =
              new Date().getDate() !== new Date(site.lastRecorded).getDate();

            if (hasSwitchedDay) {
              return {
                ...site,
                lastRecorded: new Date().toDateString(),
                days: [
                  ...site.days,
                  {
                    date: new Date().toDateString(),
                    timeSpent: 0,
                  },
                ],
              };
            }

            return {
              ...site,
              lastRecorded: new Date().toDateString(),
              days: site.days.map((day: any) => {
                const isCurrentDay = day.date === new Date().toDateString();

                if (isCurrentDay) {
                  return {
                    ...day,
                    timeSpent: day.timeSpent + 1000,
                  };
                }

                return day;
              }),
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
              lastRecorded: new Date().toDateString(),
              days: [
                {
                  date: new Date().toDateString(),
                  timeSpent: 0,
                },
              ],
            },
          ],
        });
      }
    });
  });
}, 1000);
