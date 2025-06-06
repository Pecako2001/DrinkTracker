import handler from "../[id]/drinks-per-hour";
import { fetchDrinksPerHour } from "../../../../lib/insights/drinksPerHour";

// polyfill for pg which expects TextEncoder
(global as any).TextEncoder = require("util").TextEncoder;

jest.mock("../../../../lib/insights/drinksPerHour", () => ({
  fetchDrinksPerHour: jest.fn(),
}));

const mockedFetch = fetchDrinksPerHour as jest.MockedFunction<
  typeof fetchDrinksPerHour
>;

describe("drinks-per-hour api", () => {
  test("returns hourly counts", async () => {
    mockedFetch.mockResolvedValue(Array(24).fill(1));

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = { query: { id: "5" } } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(mockedFetch).toHaveBeenCalledWith(5);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ userId: 5, hours: Array(24).fill(1) });
  });
});
