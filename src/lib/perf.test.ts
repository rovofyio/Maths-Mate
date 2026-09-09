import { describe, expect, it } from "vitest";
import { applyPowerSaver, isPowerSaverActive, shouldUsePowerSaver } from "./perf";

describe("power saver", () => {
  it("honours explicit modes", () => {
    expect(shouldUsePowerSaver("saver")).toBe(true);
    expect(shouldUsePowerSaver("full")).toBe(false);
  });

  it("applies the data-power attribute", () => {
    applyPowerSaver(true);
    expect(document.documentElement.dataset.power).toBe("saver");
    expect(isPowerSaverActive()).toBe(true);
    applyPowerSaver(false);
    expect(document.documentElement.dataset.power).toBe("full");
    expect(isPowerSaverActive()).toBe(false);
  });
});
