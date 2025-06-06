import MockAdapter from "axios-mock-adapter";
import api from "../../../api/api";
import { render, screen } from "../../../test-utils";
import LongestHydrationStreakChart from "../LongestHydrationStreakChart";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("renders streak chart", async () => {
  mock
    .onGet("/stats/longest_hydration_streaks")
    .reply(200, [{ id: 1, name: "Alice", streak: 5 }]);
  render(<LongestHydrationStreakChart />);
  expect(
    await screen.findByText(/Longest Hydration Streaks/i),
  ).toBeInTheDocument();
  expect(await screen.findByText(/Alice/)).toBeInTheDocument();
});
