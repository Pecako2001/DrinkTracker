import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent } from "../../test-utils";
import HomePage from "../index";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("searches users by nickname", async () => {
  mock.onGet("/users").reply(200, [
    { id: 1, name: "Alice", nickname: "Al", balance: 5, total_drinks: 0 },
    { id: 2, name: "Bob", balance: 5, total_drinks: 0 },
  ]);

  render(<HomePage />);

  // Wait for users to load
  await screen.findByText(/Alice/);

  const input = screen.getByPlaceholderText(/search users/i);
  await userEvent.clear(input);
  await userEvent.type(input, "al");
  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  expect(screen.queryByText(/Bob/)).not.toBeInTheDocument();
});
