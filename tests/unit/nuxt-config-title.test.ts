import { describe, expect, it } from "vitest";
import nuxtConfig from "../../nuxt.config";

describe("nuxt app metadata", () => {
  it("sets the default page title to Compare OpenAI Models", () => {
    expect(nuxtConfig.app?.head?.title).toBe("Compare OpenAI Models");
  });

  it("does not retain the legacy page title", () => {
    expect(nuxtConfig.app?.head?.title).not.toBe(
      "ChatGPT prompt tester - Compare OpenAI Models",
    );
  });
});
