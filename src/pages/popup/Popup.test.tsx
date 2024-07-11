import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Popup from "./Popup";

const setStorage = vi.fn();
const getStorage = vi.fn();

(global.chrome as any) = {
  storage: {
    local: {
      get: getStorage,
      set: setStorage,
    },
  },
};

const mockWebsites = [
  {
    url: "https://www.google.com",
    lastRecorded: new Date(),
    days: [
      {
        date: "2022-01-01",
        timeSpent: 1000,
      },
    ],
  },
  {
    url: "https://www.facebook.com",
    lastRecorded: new Date(),
    days: [
      {
        date: "2022-01-01",
        timeSpent: 2000,
      },
    ],
  },
];

describe("Popup", () => {
  beforeEach(() => {
    getStorage.mockImplementation((_, cb) => cb({ sitesData: mockWebsites }));
  });

  it("should render correctly", async () => {
    const { findByText, container } = render(<Popup />);

    expect(await findByText("Webtime Tracker")).toBeInTheDocument();
  });

  it("should list all websites with their respective spent time", async () => {
    const { findByText, queryByText, findAllByRole } = render(<Popup />);

    expect(await findByText("https://google.com")).toBeInTheDocument();
    expect(await findByText("https://facebook.com")).toBeInTheDocument();
    expect(queryByText("https://twitter.com")).not.toBeInTheDocument();

    const listItems = await findAllByRole("listitem");

    const facebookElement = listItems.find((li) =>
      li.textContent?.includes("https://facebook.com")
    );
    const googleElement = listItems.find((li) =>
      li.textContent?.includes("https://google.com")
    );

    expect(facebookElement).toHaveTextContent("2s");
    expect(googleElement).toHaveTextContent("1s");
  });
});
