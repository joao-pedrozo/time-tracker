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

  useEffect(() => {
    console.log("Popup mounted");

    chrome.storage.local.get("sitesData", (data) => {
      console.log(data);

      if (data && data.sitesData) {
        setSitesData(data.sitesData);
      }
    });
  }, []);

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
      {sitesData && (
        <div className="max-w-[260px] max-h-[260px]">
          <Doughnut
            data={{
              labels: totalOrderedSitesData(getTopSites(sitesData, 9)).map(
                (site) => site.url
              ),
              datasets: [
                {
                  data: totalOrderedSitesData(getTopSites(sitesData, 9)).map(
                    (site) => getSiteTotalTimeSpent(site) / 1000
                  ),
                  backgroundColor: totalOrderedSitesData(
                    getTopSites(sitesData, 9)
                  ).map(
                    (_, index) =>
                      `hsl(${
                        (index * 360) /
                        totalOrderedSitesData(getTopSites(sitesData, 9)).length
                      }, 100%, 50%)`
                  ),
                },
              ],
            }}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || "";
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
      <ul className="w-full text-[14px] text-neutral-600 mt-8 p-4 pb-2">
        {totalOrderedSitesData(getTopSites(sitesData, 9)).map((site, index) => (
          <li key={site.url} className="flex justify-between gap-4">
            <div className="max-w-[200px] truncate flex gap-1 items-center">
              <div
                className="w-[6px] h-[6px] rounded-full"
                style={{
                  backgroundColor: `hsl(${
                    (index * 360) /
                    totalOrderedSitesData(getTopSites(sitesData, 9)).length
                  }, 100%, 50%)`,
                }}
              ></div>
              <span className="font-bold w-[200px] dark:text-[#e8e8e8]">
                {site.url}
              </span>
            </div>
            <div className="flex gap-2 flex-nowrap">
              <span className="whitespace-nowrap">
                {percentage(
                  getSiteTotalTimeSpent(site),
                  sitesData.reduce(
                    (acc, site) =>
                      acc +
                      site.days.reduce((acc, day) => acc + day.timeSpent, 0),
                    0
                  )
                ).toFixed(2)}
                %
              </span>
              <span className="whitespace-nowrap">
                {formatSeconds(getSiteTotalTimeSpent(site) / 1000)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
