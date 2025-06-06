import MockAdapter from "axios-mock-adapter";
import api from "../../../api/api";
import { render, screen, userEvent } from "../../../test-utils";
import UserInsightPanel from "../UserInsightPanel";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("shows monthly volume chart for selected user", async () => {
  mock.onGet("/users").reply(200, [{ id: 1, name: "Alice" }]);
  const month = new Date().toISOString().slice(0, 7);
  mock
    .onGet(`/users/1/monthly_drinks`)
    .reply(200, [{ userId: 1, month, count: 2 }]);

  render(<UserInsightPanel />);

  await userEvent.click(await screen.findByLabelText(/select user/i));
  await userEvent.click(await screen.findByText(/Alice/));

  expect(await screen.findByText(/User 1/)).toBeInTheDocument();
});
