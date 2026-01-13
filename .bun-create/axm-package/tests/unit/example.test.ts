import { describe, expect, it } from "bun:test";

import { example } from "../../src/index";

describe("example", () => {
  it("returns ok", () => {
    expect(example()).toBe("ok");
  });
});
