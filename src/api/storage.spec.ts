import { hasOperation } from "./storage";

describe("Registry", () => {
  it("Should have default operations", async () => {
    let has = await hasOperation("NOT");
    expect(has).toEqual(true);
  });
});
