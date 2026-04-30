function stripDisallowedControlCharacters(value: string): string {
  let sanitized = "";

  for (const character of value) {
    const codePoint = character.charCodeAt(0);
    const isDisallowedControlCharacter =
      codePoint <= 0x08 ||
      (codePoint >= 0x0b && codePoint <= 0x0c) ||
      (codePoint >= 0x0e && codePoint <= 0x1f) ||
      codePoint === 0x7f;

    if (!isDisallowedControlCharacter) {
      sanitized += character;
    }
  }

  return sanitized;
}

const MAX_UNTRUSTED_SECTION_CHARACTERS = 12000;
const TRUNCATION_MARKER = "\n<<UNTRUSTED_CONTENT_TRUNCATED>>";

const MARKERS = {
  originalPrompt: {
    start: "<<UNTRUSTED_ORIGINAL_PROMPT_START>>",
    end: "<<UNTRUSTED_ORIGINAL_PROMPT_END>>",
  },
  response1: {
    start: "<<UNTRUSTED_RESPONSE_1_START>>",
    end: "<<UNTRUSTED_RESPONSE_1_END>>",
  },
  response2: {
    start: "<<UNTRUSTED_RESPONSE_2_START>>",
    end: "<<UNTRUSTED_RESPONSE_2_END>>",
  },
} as const;

function normalizeUntrustedText(value: string): string {
  return stripDisallowedControlCharacters(
    value.replaceAll("\r\n", "\n").replaceAll("\r", "\n"),
  ).replaceAll("```", "``\\`");
}

function enforceSizeLimit(value: string): string {
  if (value.length <= MAX_UNTRUSTED_SECTION_CHARACTERS) {
    return value;
  }

  const maxWithoutMarker =
    MAX_UNTRUSTED_SECTION_CHARACTERS - TRUNCATION_MARKER.length;

  if (maxWithoutMarker <= 0) {
    return TRUNCATION_MARKER.slice(0, MAX_UNTRUSTED_SECTION_CHARACTERS);
  }

  return `${value.slice(0, maxWithoutMarker)}${TRUNCATION_MARKER}`;
}

function toUntrustedBlock(
  value: string,
  marker: { start: string; end: string },
): string {
  const normalized = enforceSizeLimit(normalizeUntrustedText(value));
  return `${marker.start}\n${normalized}\n${marker.end}`;
}

export function buildSafeComparisonPrompt(options: {
  template: string;
  originalPrompt: string;
  response1: string;
  response2: string;
}): string {
  return options.template
    .replaceAll(
      "{{ORIGINAL_PROMPT}}",
      toUntrustedBlock(options.originalPrompt, MARKERS.originalPrompt),
    )
    .replaceAll(
      "{{RESPONSE_1}}",
      toUntrustedBlock(options.response1, MARKERS.response1),
    )
    .replaceAll(
      "{{RESPONSE_2}}",
      toUntrustedBlock(options.response2, MARKERS.response2),
    );
}
