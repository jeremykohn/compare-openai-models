import { describe, expect, it } from "vitest";
import {
  parseAllowedHosts,
  parseBooleanConfig,
  parseInvalidAllowedHosts,
  validateOpenAIRuntimeConfig,
} from "../../server/utils/openai-security";

describe("openai-security", () => {
  it("parses booleans", () => {
    expect(parseBooleanConfig("true")).toBe(true);
    expect(parseBooleanConfig("1")).toBe(true);
    expect(parseBooleanConfig("false")).toBe(false);
  });

  it("parses and validates allowlist hosts", () => {
    expect(parseAllowedHosts("api.openai.com,example.com")).toEqual([
      "api.openai.com",
      "example.com",
    ]);
    expect(parseInvalidAllowedHosts("api.openai.com, bad host")).toEqual([
      "bad host",
    ]);
  });

  it("validates runtime config", () => {
    const result = validateOpenAIRuntimeConfig({
      openaiApiKey: "sk-test-12345678",
      openaiBaseUrl: "https://api.openai.com/v1",
      openaiAllowedHosts: "api.openai.com",
      openaiAllowInsecureHttp: "false",
    });

    expect(result.baseUrl).toBe("https://api.openai.com/v1");
  });
});
