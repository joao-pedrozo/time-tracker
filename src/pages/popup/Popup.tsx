import { useEffect, useState } from "react";
import logo from "@assets/img/logo.svg";

export default function Popup(): JSX.Element {
  const [sitesData, setSitesData] = useState({});

  useEffect(() => {
    chrome.storage.local.get("sitesData", (data) => {
      console.log(data.sitesData);

      if (data && data.sitesData) {
        setSitesData(data.sitesData);
      }
    });
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img
          src={logo}
          className="h-36 pointer-events-none animate-spin-slow"
          alt="logo"
        />
        <p>
          Edit123 <code>src/pages/popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <ul>
          {Object.entries(sitesData).map(([site, time]) => (
            <li key={site} className="text-red-700">
              <strong>{site}:</strong> {time} seconds
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}
