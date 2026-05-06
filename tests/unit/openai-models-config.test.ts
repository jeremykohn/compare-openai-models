import { describe, expect, it, vi, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  buildExclusionSet,
  loadOpenAIModelsConfig,
} from "../../server/utils/openai-models-config-loader";

describe("openai-models-config-loader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads valid schema with unavailable-models", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");

    try {
      await writeFile(
        file,
        JSON.stringify({
          "unavailable-models": ["bad-model", "legacy-model", "bad-model"],
        }),
        "utf8",
      );

      const result = await loadOpenAIModelsConfig(file);
      expect(result.isValid).toBe(true);

      if (result.isValid) {
        const exclusion = buildExclusionSet(result.config);
        expect(exclusion.size).toBe(2);
        expect(exclusion.has("bad-model")).toBe(true);
        expect(exclusion.has("legacy-model")).toBe(true);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("logs warning when extra keys are present", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await writeFile(
        file,
        JSON.stringify({
          "unavailable-models": ["bad-model"],
          "other-models": ["legacy-key"],
        }),
        "utf8",
      );

      const result = await loadOpenAIModelsConfig(file);

      expect(result.isValid).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("other-models"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only "unavailable-models" is a valid key'),
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("logs error and returns invalid when unavailable-models is missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await writeFile(file, JSON.stringify({ "other-models": [] }), "utf8");

      const result = await loadOpenAIModelsConfig(file);

      expect(result.isValid).toBe(false);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing required key "unavailable-models"'),
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns invalid when unavailable-models is not a string array", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");

    try {
      await writeFile(
        file,
        JSON.stringify({ "unavailable-models": ["valid", 42] }),
        "utf8",
      );

      const result = await loadOpenAIModelsConfig(file);
      expect(result.isValid).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns invalid on non-object JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "openai-models.json");

    try {
      await writeFile(file, JSON.stringify(["unavailable-models"]), "utf8");

      const result = await loadOpenAIModelsConfig(file);
      expect(result.isValid).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns invalid on unreadable or missing file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "models-config-"));
    const file = join(dir, "missing-openai-models.json");

    try {
      const result = await loadOpenAIModelsConfig(file);
      expect(result.isValid).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
