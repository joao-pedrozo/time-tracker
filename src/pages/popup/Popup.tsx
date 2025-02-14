import { useEffect, useState } from "react";
import WebsitesList from "./WebsitesList";
import WebsitesChart from "./WebsitesChart";
import Header from "./Header";

export interface SitesData {
  url: string;
  lastRecorded: Date;
  days: {
    date: string;
    timeSpent: number;
  }[];
}

const blacklistedSites = ["extensions", "newtab"];

export default function Popup(): JSX.Element {
  const [sitesData, setSitesData] = useState<SitesData[]>([]);
  const [currentDay, setCurrentDay] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get("sitesData", (data) => {
      console.log(data);

      if (data && data.sitesData) {
        setSitesData(data.sitesData);
        setCurrentDay(data.sitesData[0]?.days[0]?.date || "");
      }
    });
  }, []);

  const handlePreviousDay = () => {
    const currentIndex = sitesData.findIndex((site) =>
      site.days.some((day) => day.date === currentDay)
    );
    if (currentIndex > 0) {
      const previousDay = sitesData[currentIndex - 1].days[0].date;
      setCurrentDay(previousDay);
    }
  };

  const handleNextDay = () => {
    const currentIndex = sitesData.findIndex((site) =>
      site.days.some((day) => day.date === currentDay)
    );
    if (currentIndex < sitesData.length - 1) {
      const nextDay = sitesData[currentIndex + 1].days[0].date;
      setCurrentDay(nextDay);
    }
  };

  const filteredSitesData = sitesData
    .filter(
      (site) =>
        site.days.some((day) => day.date === currentDay) &&
        !blacklistedSites.some((blacklistedSite) =>
          site.url.includes(blacklistedSite)
        )
    )
    .map((site) => ({
      ...site,
      url: site.url.replace("www.", ""),
    }))
    .sort((a, b) => {
      const siteA = a.days.find((day) => day.date === currentDay);
      const siteB = b.days.find((day) => day.date === currentDay);

      if (!siteA || !siteB) {
        return 0;
      }

      return siteB.timeSpent - siteA.timeSpent;
    });

  return (
    <div className="flex items-center flex-col bg-white dark:dark:bg-[#0f0f0f]">
      <Header />
      <div className="flex justify-between items-center px-4 gap-2 text-white mt-[8px] mb-[18px]">
        <button onClick={handlePreviousDay}>Previous Day</button>
        <h2>{currentDay}</h2>
        <button onClick={handleNextDay}>Next Day</button>
      </div>
      {filteredSitesData.length > 0 && (
        <WebsitesChart sites={filteredSitesData} />
      )}
      {filteredSitesData.length > 0 && (
        <WebsitesList currentDay={currentDay} websites={filteredSitesData} />
      )}
    </div>
  );
}
