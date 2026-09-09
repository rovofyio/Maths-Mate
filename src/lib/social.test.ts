import { beforeEach, describe, expect, it } from "vitest";
import {
  connectFacebook,
  connectGoogle,
  disconnectFacebook,
  disconnectGoogle,
  getSocialIds,
  saveSocialIds,
  SocialSetupError,
} from "./social";

beforeEach(() => {
  localStorage.clear();
});

describe("social credentials", () => {
  it("starts empty and round-trips through local storage", () => {
    expect(getSocialIds()).toEqual({ googleClientId: "", facebookAppId: "" });
    saveSocialIds({ googleClientId: "  google-id  ", facebookAppId: "fb-id" });
    expect(getSocialIds()).toEqual({ googleClientId: "google-id", facebookAppId: "fb-id" });
  });

  it("connect throws a setup error (not a crash) when IDs are missing", async () => {
    await expect(connectGoogle()).rejects.toBeInstanceOf(SocialSetupError);
    await expect(connectFacebook()).rejects.toBeInstanceOf(SocialSetupError);
  });

  it("disconnect resolves quietly when no SDK was ever loaded", async () => {
    await expect(disconnectGoogle()).resolves.toBeUndefined();
    await expect(disconnectFacebook()).resolves.toBeUndefined();
  });
});
