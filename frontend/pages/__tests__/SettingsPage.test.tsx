import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent, waitFor } from "../../test-utils";
import SettingsPage from "../SettingsPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
  localStorage.clear();
});

test("logs in and shows admin tables", async () => {
  mock.onPost("/auth/login").reply(200, { access_token: "tok" });
  mock.onGet("/users").reply(200, []);
  mock.onGet("/payments").reply(200, []);
  mock.onGet("/backups").reply(200, []);
  render(<SettingsPage />);
  await userEvent.type(
    screen.getByPlaceholderText(/enter admin password/i),
    "pass",
  );
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => expect(localStorage.getItem("admin_token")).toBe("tok"));
  expect(screen.getByText(/user management/i)).toBeInTheDocument();
});
