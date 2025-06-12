import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent, waitFor } from "../../test-utils";
import StatsPage from "../StatsPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("renders user monthly comparison chart", async () => {
  mock.onGet("/users").reply(200, [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
  mock.onGet(/\/insights\/monthly_totals/).reply(200, [
    { userId: 1, month: "2024-01", count: 2 },
    { userId: 2, month: "2024-01", count: 1 },
  ]);
  render(<StatsPage />);
  const combo = await screen.findByRole("combobox");
  await userEvent.click(combo);
  await userEvent.click(screen.getByText(/alice/i));
  await waitFor(() => expect(mock.history.get.length).toBeGreaterThan(1));
  expect(await screen.findByRole("img", { hidden: true })).toBeInTheDocument();
});
