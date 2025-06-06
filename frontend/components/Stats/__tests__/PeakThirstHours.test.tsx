import { render, screen } from "../../../test-utils";
import PeakThirstHours, { toPercentages } from "../PeakThirstHours";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ hours: Array(24).fill(1) }),
    } as Response),
  ) as jest.Mock;
});

afterEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

test("converts counts to percentages", () => {
  expect(toPercentages([1, 1, 2])).toEqual([25, 25, 50]);
});

test("renders chart after fetch", async () => {
  render(<PeakThirstHours userId="1" />);
  expect(global.fetch).toHaveBeenCalledWith("/api/users/1/drinks-per-hour");
  expect(await screen.findByText(/Peak Thirst Hours/i)).toBeInTheDocument();
});
