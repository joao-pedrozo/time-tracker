import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import type { SitesData } from "./Popup";
import formatSeconds from "@src/utils/formatSeconds";

ChartJS.register(ArcElement);
ChartJS.register(Tooltip);

const getTopSites = (sitesData: SitesData[], limit: number) =>
  totalOrderedSitesData(sitesData).slice(0, limit);

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

const getSiteTotalTimeSpent = (site: SitesData) =>
  site.days.reduce((acc, day) => acc + day.timeSpent, 0);

export default function WebsitesChart({ sites }: { sites: SitesData[] }) {
  const chartLabels = totalOrderedSitesData(getTopSites(sites, 9)).map(
    (site) => site.url
  );

  const chartDatasets = [
    {
      data: totalOrderedSitesData(getTopSites(sites, 9)).map(
        (site) => getSiteTotalTimeSpent(site) / 1000
      ),
      backgroundColor: totalOrderedSitesData(getTopSites(sites, 9)).map(
        (_, index) =>
          `hsl(${
            (index * 360) / totalOrderedSitesData(getTopSites(sites, 9)).length
          }, 50%, 50%)`
      ),
    },
  ];

  return (
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
  );
}
