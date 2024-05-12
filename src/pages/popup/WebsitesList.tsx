import { SitesData, formatSeconds } from "./Popup";

export default function WebsitesList({
  websites,
  currentDay,
}: {
  websites: SitesData[];
  currentDay: string;
}) {
  return (
    <ul className="w-full text-[14px] text-neutral-600 mt-2 p-4 pb-2">
      {websites.map((site) => (
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
  );
}
