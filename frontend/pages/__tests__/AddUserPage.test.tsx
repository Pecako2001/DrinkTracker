import MockAdapter from "axios-mock-adapter";
import api from "../../api/api";
import { render, screen, userEvent, waitFor } from "../../test-utils";
import AddUserPage from "../AddUserPage";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
  localStorage.clear();
});

test("adds multiple users", async () => {
  mock.onPost("/auth/login").reply(200, { access_token: "tok" });
  mock.onPost("/users").reply(201);

  render(<AddUserPage />);

  await userEvent.type(
    screen.getByPlaceholderText(/enter admin password/i),
    "pass",
  );
  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => expect(localStorage.getItem("admin_token")).toBe("tok"));

  await userEvent.click(screen.getByRole("button", { name: /add another/i }));
  const inputs = screen.getAllByLabelText(/name/i);
  await userEvent.type(inputs[0], "Alice");
  await userEvent.type(inputs[1], "Bob");

  await userEvent.click(screen.getByRole("button", { name: /create users/i }));

  await waitFor(() =>
    expect(mock.history.post.filter((r) => r.url === "/users").length).toBe(2),
  );

  const userPosts = mock.history.post.filter((r) => r.url === "/users");
  expect(JSON.parse(userPosts[0].data)).toEqual({ name: "Alice" });
  expect(JSON.parse(userPosts[1].data)).toEqual({ name: "Bob" });
});
