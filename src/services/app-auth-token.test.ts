import { afterEach, describe, expect, it } from "vitest";
import {
  clearAppAccessToken,
  getAppAccessToken,
  getAppAuthSource,
  setAppAccessToken,
} from "./app-auth-token";

describe("app auth token persistence", () => {
  afterEach(() => {
    clearAppAccessToken();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("stores non-remembered sessions in sessionStorage by default", () => {
    setAppAccessToken("123|sessiontoken", "password");

    expect(getAppAccessToken()).toBe("123|sessiontoken");
    expect(getAppAuthSource()).toBe("password");
    expect(window.sessionStorage.getItem("tct_app_access_token")).toBe("123|sessiontoken");
    expect(window.localStorage.getItem("tct_app_access_token")).toBeNull();
  });

  it("stores remembered sessions in localStorage", () => {
    setAppAccessToken("456|localtoken", "password", "local");

    expect(getAppAccessToken()).toBe("456|localtoken");
    expect(getAppAuthSource()).toBe("password");
    expect(window.localStorage.getItem("tct_app_access_token")).toBeNull();
    expect(window.sessionStorage.getItem("tct_app_access_token")).toBe("456|localtoken");
  });
});
