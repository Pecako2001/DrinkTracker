import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent } from "../../test-utils";
import StatsPage from "../StatsPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
});

test("navigates leaderboard tabs", async () => {
  mock.onGet("/stats/monthly_leaderboard").reply(200, []);
  mock.onGet("/stats/yearly_leaderboard").reply(200, []);
  mock.onGet("/users").reply(200, []);
  render(<StatsPage />);

  // Monthly is default
  expect(await screen.findByText(/this month/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: /yearly/i }));
  expect(await screen.findByText(/this year/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: /all time/i }));
  expect(await screen.findByText(/all time/i)).toBeInTheDocument();
});
