import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent } from "../../test-utils";
import StatsPage from "../StatsPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("navigates leaderboard tabs", async () => {
  mock.onGet(/\/stats\//).reply(200, []);
  mock.onGet("/users").reply(200, []);
  render(<StatsPage />);

  // Monthly is default
  expect(await screen.findAllByText(/this month/i)).toHaveLength(2);

  await userEvent.click(screen.getByRole("tab", { name: /yearly/i }));
  expect(await screen.findAllByText(/this year/i)).toHaveLength(2);

  await userEvent.click(screen.getByRole("tab", { name: /all time/i }));
  expect(await screen.findAllByText(/all time/i)).toHaveLength(2);
});
