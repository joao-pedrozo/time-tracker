import { useEffect, useState } from "react";
import logo from "@assets/img/logo.svg";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";

ChartJS.register(ArcElement);
ChartJS.register(Tooltip);

interface SitesData {
  url: string;
  lastRecorded: Date;
  timeSpent: number;
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

  // Concatenate the strings based on the presence of hours, minutes, and seconds
  const formattedTime = [hoursString, minutesString, secondsString]
    .filter(Boolean)
    .join(" ");

  return formattedTime;
}

const percentage = (value: number, total: number) => (value / total) * 100;

const orderedSitesData = (sitesData: SitesData[]) =>
  sitesData.sort((a, b) => b.timeSpent - a.timeSpent);

const getTopSites = (sitesData: SitesData[], limit: number) =>
  orderedSitesData(sitesData).slice(0, limit);

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
    <div className="flex items-center flex-col p-4">
      <h1 className="text-center mb-4 font-bold text-2xl bg-gradient-to-r from-green-400 to-blue-500 inline-block text-transparent bg-clip-text">
        Webtime Tracker
      </h1>
      {sitesData && (
        <div className="max-w-[260px] max-h-[260px] ">
          <Doughnut
            data={{
              labels: orderedSitesData(getTopSites(sitesData, 9)).map(
                (site) => site.url
              ),
              datasets: [
                {
                  data: orderedSitesData(getTopSites(sitesData, 9)).map(
                    (site) => site.timeSpent / 1000
                  ),
                  backgroundColor: orderedSitesData(
                    getTopSites(sitesData, 9)
                  ).map(
                    (_, index) =>
                      `hsl(${
                        (index * 360) /
                        orderedSitesData(getTopSites(sitesData, 9)).length
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
                      return `${label}: ${value}s`;
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
      <ul className="w-full text-[14px] text-neutral-600 mt-8">
        {orderedSitesData(getTopSites(sitesData, 9)).map((site) => (
          <li key={site.url} className="flex justify-between gap-4">
            <div className="max-w-[200px] truncate">
              <span className="font-bold w-[200px]">{site.url}</span>
            </div>
            <div className="flex gap-2">
              <span>
                {percentage(
                  site.timeSpent,
                  sitesData.reduce((acc, site) => acc + site.timeSpent, 0)
                ).toFixed(2)}
                %
              </span>
              <span>{formatSeconds(site.timeSpent / 1000)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
