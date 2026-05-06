import { describe, expect, it } from "vitest";
import { validatePrompt } from "../../app/utils/prompt-validation";

describe("validatePrompt", () => {
  it("returns error for empty trimmed prompt", () => {
    const result = validatePrompt("   ");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.message).toBe("Please enter a prompt.");
    }
  });

  it("returns valid result for prompt longer than 4000 characters", () => {
    const result = validatePrompt("a".repeat(4001));
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.trimmedPrompt).toHaveLength(4001);
    }
  });

  it("returns trimmed value for valid prompt", () => {
    const result = validatePrompt("  hello world  ");
    expect(result).toEqual({
      isValid: true,
      trimmedPrompt: "hello world",
    });
  });
});
