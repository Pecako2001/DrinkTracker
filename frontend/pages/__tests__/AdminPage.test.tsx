import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent, waitFor } from "../../test-utils";
import AdminPage from "../AdminPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
  localStorage.clear();
});

test("tab switching and user search", async () => {
  mock.onPost("/auth/login").reply(200, { access_token: "tok" });
  mock.onGet("/users").reply(200, [
    { id: 1, name: "Ethan", balance: 25, total_drinks: 0 },
    { id: 2, name: "Olivia", balance: 10, total_drinks: 0 },
  ]);
  mock.onGet("/payments").reply(200, []);

  render(<AdminPage />);

  await userEvent.type(
    screen.getByPlaceholderText(/enter admin password/i),
    "pass",
  );
  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => screen.getByText(/manage users/i));
  const searchInput = screen.getByPlaceholderText(/search users/i);
  await userEvent.type(searchInput, "olivia");
  expect(screen.getByText(/Olivia/i)).toBeInTheDocument();
  expect(screen.queryByText(/Ethan/i)).not.toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("tab", { name: /payments/i })[0]);
  expect(
    screen.getByRole("heading", { name: /payments/i }),
  ).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("tab", { name: /users/i })[0]);
  expect(
    screen.getByRole("heading", { name: /manage users/i }),
  ).toBeInTheDocument();
});
