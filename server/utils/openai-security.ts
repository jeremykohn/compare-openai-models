type RuntimeConfigInput = {
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiAllowedHosts: string;
  openaiAllowInsecureHttp?: string;
};

export type OpenAISecurityConfig = {
  apiKey: string;
  baseUrl: string;
  allowInsecureHttp: boolean;
};

export function parseBooleanConfig(value?: string): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function parseAllowedHosts(input: string): string[] {
  return input
    .split(",")
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);
}

export function parseInvalidAllowedHosts(input: string): string[] {
  return input
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => {
      if (!segment) {
        return false;
      }

      return /\s/.test(segment) || segment.includes("/");
    });
}

function sanitizeHost(host: string): string {
  return host.trim().toLowerCase();
}

function validateBaseUrlProtocol(
  baseUrl: URL,
  allowInsecureHttp: boolean,
): void {
  if (baseUrl.protocol === "https:") {
    return;
  }

  if (baseUrl.protocol === "http:" && allowInsecureHttp) {
    return;
  }

  throw new Error("Invalid base URL protocol");
}

export function validateOpenAIRuntimeConfig(
  config: RuntimeConfigInput,
): OpenAISecurityConfig {
  const apiKey = config.openaiApiKey?.trim();
  if (!apiKey) {
    throw new Error("Missing API key");
  }

  const allowInsecureHttp = parseBooleanConfig(config.openaiAllowInsecureHttp);
  const allowedHosts = parseAllowedHosts(config.openaiAllowedHosts ?? "");
  if (allowedHosts.length === 0) {
    throw new Error("Empty allowlist");
  }

  const invalidAllowedHosts = parseInvalidAllowedHosts(
    config.openaiAllowedHosts ?? "",
  );
  if (invalidAllowedHosts.length > 0) {
    throw new Error("Invalid allowlist entries");
  }

  const baseUrlValue = config.openaiBaseUrl?.trim();
  if (!baseUrlValue) {
    throw new Error("Missing base URL");
  }

  const baseUrl = new URL(baseUrlValue);

  if (baseUrl.username || baseUrl.password) {
    throw new Error("Credentials are not allowed in URL");
  }

  validateBaseUrlProtocol(baseUrl, allowInsecureHttp);

  const hostAllowed = allowedHosts.includes(sanitizeHost(baseUrl.hostname));
  if (!hostAllowed) {
    throw new Error("Host not allowed");
  }

  return {
    apiKey,
    baseUrl: baseUrl.toString().replace(/\/$/, ""),
    allowInsecureHttp,
  };
}
