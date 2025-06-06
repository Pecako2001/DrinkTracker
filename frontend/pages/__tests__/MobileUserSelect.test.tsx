import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent } from "../../test-utils";
import MobileUserSelectPage from "../MobileUserSelect";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("filters users by name and nickname", async () => {
  mock.onGet("/users").reply(200, [
    { id: 1, name: "Alice", nickname: "Al", balance: 5, total_drinks: 0 },
    { id: 2, name: "Bob", balance: 5, total_drinks: 0 },
  ]);

  render(<MobileUserSelectPage />);

  // Wait for users to load
  await screen.findByText(/Alice/);

  const input = screen.getByPlaceholderText(/search users/i);
  await userEvent.clear(input);
  await userEvent.type(input, "al");
  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  expect(screen.queryByText(/Bob/)).not.toBeInTheDocument();

  await userEvent.clear(input);
  await userEvent.type(input, "bob");
  expect(screen.getByText(/Bob/)).toBeInTheDocument();
  expect(screen.queryByText(/Alice/)).not.toBeInTheDocument();
});
