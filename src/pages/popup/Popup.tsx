import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { MoonStars, GithubLogo } from "@phosphor-icons/react";

ChartJS.register(ArcElement);
ChartJS.register(Tooltip);

interface SitesData {
  url: string;
  lastRecorded: Date;
  days: {
    date: string;
    timeSpent: number;
  }[];
}

function formatSeconds(seconds: number) {
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

const percentage = (value: number, total: number) => (value / total) * 100;

const totalOrderedSitesData = (sitesData: SitesData[]) => {
  return sitesData.sort(() => {
    const aTotalTime = sitesData.reduce(
      (acc, site) =>
        acc + site.days.reduce((acc, day) => acc + day.timeSpent, 0),
      0
    );
    const bTotalTime = sitesData.reduce(
      (acc, site) =>
        acc + site.days.reduce((acc, day) => acc + day.timeSpent, 0),
      0
    );

    return bTotalTime - aTotalTime;
  });
};

const getTopSites = (sitesData: SitesData[], limit: number) =>
  totalOrderedSitesData(sitesData).slice(0, limit);

const getSiteTotalTimeSpent = (site: SitesData) =>
  site.days.reduce((acc, day) => acc + day.timeSpent, 0);

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

  const filteredSitesData = sitesData.filter((site) =>
    site.days.some((day) => day.date === currentDay)
  );

  const chartLabels = totalOrderedSitesData(
    getTopSites(filteredSitesData, 9)
  ).map((site) => site.url);

  const chartDatasets = [
    {
      data: totalOrderedSitesData(getTopSites(filteredSitesData, 9)).map(
        (site) => getSiteTotalTimeSpent(site) / 1000
      ),
      backgroundColor: totalOrderedSitesData(
        getTopSites(filteredSitesData, 9)
      ).map(
        (_, index) =>
          `hsl(${
            (index * 360) /
            totalOrderedSitesData(getTopSites(filteredSitesData, 9)).length
          }, 100%, 50%)`
      ),
    },
  ];

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
        <div className="max-w-[260px] max-h-[260px]">
          <Doughnut
            data={{
              labels: chartLabels,
              datasets: chartDatasets,
            }}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed || 0;
                      return formatSeconds(value);
                    },
                  },
                },
              },
            }}
            width={400}
            height={400}
          />
        </div>
      )}
      {filteredSitesData.length > 0 && (
        <ul className="w-full text-[14px] text-neutral-600 mt-2 p-4 pb-2">
          {filteredSitesData.map((site) => (
            <li key={site.url} className="flex justify-between gap-4">
              <div className="max-w-[200px] truncate flex gap-1 items-center">
                <div
                  className="w-[6px] h-[6px] rounded-full"
                  style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  }}
                ></div>
                <span className="font-bold w-[200px] dark:text-[#e8e8e8]">
                  {site.url}
                </span>
              </div>
              <ul className="flex gap-2 flex-nowrap">
                {site.days
                  .filter((day) => day.date === currentDay)
                  .map((day) => (
                    <li key={day.date}>
                      <span className="whitespace-nowrap">
                        {formatSeconds(day.timeSpent / 1000)}
                      </span>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
