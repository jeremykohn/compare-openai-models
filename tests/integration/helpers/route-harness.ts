import { vi } from "vitest";

type RuntimeConfigShape = {
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiAllowedHosts: string;
  openaiAllowInsecureHttp: string;
  openaiDisableModelsCache?: string;
};

const defaultRuntimeConfig: RuntimeConfigShape = {
  openaiApiKey: "sk-test-12345678",
  openaiBaseUrl: "https://api.openai.com/v1",
  openaiAllowedHosts: "api.openai.com",
  openaiAllowInsecureHttp: "false",
  openaiDisableModelsCache: "true",
};

export function buildRuntimeConfig(
  overrides: Partial<RuntimeConfigShape> = {},
): RuntimeConfigShape {
  return {
    ...defaultRuntimeConfig,
    ...overrides,
  };
}

export function mockFetchImplementation(implementation: typeof fetch): void {
  vi.stubGlobal("fetch", implementation);
}

export async function loadModelsHandler(
  runtimeConfig: RuntimeConfigShape,
): Promise<() => Promise<unknown>> {
  vi.resetModules();

  vi.doMock("#imports", () => ({
    useRuntimeConfig: () => runtimeConfig,
  }));

  const routeModule = await import("../../../server/api/models.get");
  return routeModule.default as () => Promise<unknown>;
}

export async function loadRespondHandler(
  runtimeConfig: RuntimeConfigShape,
  body: unknown,
): Promise<(event: unknown) => Promise<unknown>> {
  vi.resetModules();

  vi.doMock("#imports", () => ({
    useRuntimeConfig: () => runtimeConfig,
  }));

  vi.doMock("h3", async () => {
    const actual = await vi.importActual<typeof import("h3")>("h3");

    return {
      ...actual,
      readBody: vi.fn(async () => body),
    };
  });

  const routeModule = await import("../../../server/api/respond.post");
  return routeModule.default as (event: unknown) => Promise<unknown>;
}
