import { describe, expect, it } from "vitest";
import {
  sanitizeErrorText,
  sanitizeOptionalErrorText,
} from "../../app/utils/error-sanitization";

describe("error sanitization", () => {
  it("redacts keys, bearer tokens and auth header", () => {
    const value =
      "Authorization: Bearer sk_123\nBearer abc.def\nkey sk-secret-12345678";
    const sanitized = sanitizeErrorText(value);
    expect(sanitized).not.toContain("sk-secret-12345678");
    expect(sanitized).toContain("[REDACTED]");
  });

  it("returns undefined for empty optional values", () => {
    expect(sanitizeOptionalErrorText("   ")).toBeUndefined();
  });
});
