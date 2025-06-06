import MockAdapter from "axios-mock-adapter";
import api from "../../../api/api";
import { render, screen } from "../../../test-utils";
import SocialSipChart from "../SocialSipChart";

const mock = new MockAdapter(api);

afterEach(() => {
  mock.reset();
  mock.restore();
});

test("renders social sip data", async () => {
  mock.onGet("/users/1/buddies").reply(200, [{ id: 2, name: "Bob", count: 3 }]);
  render(<SocialSipChart userId="1" />);
  expect(await screen.findByText(/Bob/)).toBeInTheDocument();
});
