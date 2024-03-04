import { useEffect, useState } from "react";
import logo from "@assets/img/logo.svg";
import { Pie } from "react-chartjs-2";
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
      <span className="text-center mb-4">Data</span>
      {sitesData && (
        <div className="max-w-[350px] max-h-[350px] ">
          <Pie
            data={{
              labels: sitesData.map((site) => site.url),
              datasets: [
                {
                  data: sitesData.map((site) => site.timeSpent / 1000),
                  backgroundColor: sitesData.map(
                    (_, index) =>
                      `hsl(${(index * 360) / sitesData.length}, 100%, 50%)`
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
      <span>Data</span>
      <ul>
        {sitesData.map((site) => (
          <li key={site.url}>
            {site.url} - {formatSeconds(site.timeSpent / 1000)}
          </li>
        ))}
      </ul>
    </div>
  );
}
