import { MoonStars, GithubLogo } from "@phosphor-icons/react";

export default function Header() {
  return (
    <header className="w-full font-bold text-2xl flex justify-between items-center px-4 pt-4">
      <h1 className="bg-gradient-to-r from-green-400 to-blue-500 inline-block text-transparent bg-clip-text">
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
  );
}
