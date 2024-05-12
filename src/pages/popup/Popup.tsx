import { useEffect, useState } from "react";
import { MoonStars, GithubLogo } from "@phosphor-icons/react";
import WebsitesList from "./WebsitesList";
import WebsitesChart from "./WebsitesChart";

export interface SitesData {
  url: string;
  lastRecorded: Date;
  days: {
    date: string;
    timeSpent: number;
  }[];
}

const blacklistedSites = ["extensions", "newtab"];

export function formatSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hoursString =
    hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "";
  const minutesString =
    remainingMinutes > 0
      ? `${remainingMinutes}${remainingMinutes === 1 ? "m" : "m"}`
      : "";
  const secondsString =
    remainingSeconds > 0
      ? `${remainingSeconds}${remainingSeconds === 1 ? "s" : "s"}`
      : "";

  const formattedTime = [hoursString, minutesString, secondsString]
    .filter(Boolean)
    .join(" ");

  return formattedTime;
}

export default function Popup(): JSX.Element {
  const [sitesData, setSitesData] = useState<SitesData[]>([]);
  const [currentDay, setCurrentDay] = useState<string>("");

  useEffect(() => {
    console.log("Popup mounted");

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

  const filteredSitesData = sitesData.filter(
    (site) =>
      site.days.some((day) => day.date === currentDay) &&
      !blacklistedSites.some((blacklistedSite) =>
        site.url.includes(blacklistedSite)
      )
  );

  return (
    <div className="flex items-center flex-col bg-white dark:dark:bg-[#0f0f0f]">
      <header className="w-full font-bold text-2xl flex justify-between items-center px-4 py-4">
        <h1 className="mb-4 bg-gradient-to-r from-green-400 to-blue-500 inline-block text-transparent bg-clip-text">
          Webtime Tracker
        </h1>
        <div className="mt-[-8px] flex gap-2">
          <button
            onClick={() => {
              const body = document.querySelector("body");
              body?.classList.toggle("dark");
            }}
          >
            <MoonStars className="p-0 text-black dark:text-white" size={24} />
          </button>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/joao-pedrozo/time-tracker"
          >
            <GithubLogo className="p-0 text-black dark:text-white" size={24} />
          </a>
        </div>
      </header>
      <div className="flex justify-between items-center px-4 py-2 gap-2 text-white">
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
