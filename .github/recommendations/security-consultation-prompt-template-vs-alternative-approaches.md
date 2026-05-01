# Security Consultation: Prompt Template vs. Alternative Approaches

## Executive Recommendation

Use **Approach C (prompt template + comprehensive safeguards)** as your default production strategy, with an optional lightweight version of **Approach D** (secondary validator/classifier call) for high-risk or flagged inputs.

Why this is the best balance:
- **Security**: Stronger boundaries around untrusted content than A or B
- **Maintainability**: Stable, testable template contract vs ad-hoc prompt construction
- **Performance**: One primary LLM call; optional validator only when needed
- **Fidelity**: Preserves original content while reducing injection leverage

---

## 1) Alternative Approaches and Trade-offs

### Alternative 1: Structured-message prompting (schema-separated fields)
Instead of interpolating a single long string, send instructions and untrusted content in separate structured fields (e.g., JSON/object fields).

- **Pros**: Clear separation of trusted instructions vs untrusted data; easier validation and testing
- **Cons**: Not all APIs/models consistently honor strict field boundaries semantically
- **Complexity**: Medium
- **Cost/Latency**: Similar to template approach
- **Usability**: Good for engineering teams with typed contracts

### Alternative 2: Tool/function-based comparison pipeline
Use deterministic code (non-LLM) to preprocess/segment responses, then ask LLM only for bounded comparison tasks.

- **Pros**: Shrinks model decision surface; strong control over preprocessing
- **Cons**: More engineering work; may reduce flexibility for nuanced judgment
- **Complexity**: Medium-high
- **Cost/Latency**: Can improve or worsen depending on pipeline steps
- **Usability**: Best for mature production systems

### Alternative 3: Two-stage LLM flow (classifier → comparer)
First call detects/labels potentially adversarial patterns; second call performs comparison with risk-aware instructions.

- **Pros**: Better detection and triage for suspicious inputs
- **Cons**: Extra cost/latency; validator can also be bypassed or false-positive
- **Complexity**: Medium
- **Cost/Latency**: Higher (extra call)
- **Usability**: Good for enterprise-risk contexts

### Alternative 4: No reusable template (ad-hoc prompt construction)
Build prompt text dynamically each time without a canonical template.

- **Pros**: Flexible
- **Cons**: Highest drift risk, inconsistent safety controls, hard to test/review
- **Complexity**: Low initially, high long-term
- **Cost/Latency**: Similar runtime; worse engineering cost over time
- **Usability**: Poor at scale

---

## 2) Template Hardening: Is It More Secure?

Yes. A prompt template with robust safeguards is generally more secure than ad-hoc prompt construction because it gives you a **repeatable control plane**.

Most effective safeguards:
1. **Strict trusted/untrusted boundaries**: Wrap every untrusted section with explicit sentinel markers.
2. **Deterministic normalization**: Normalize line endings, strip disallowed control chars, preserve printable content.
3. **Fence breakout neutralization**: Prevent untrusted text from escaping structural wrappers (for markdown/code contexts).
4. **Stable instruction hierarchy**: Keep non-negotiable safety instructions outside untrusted blocks.
5. **Length/token guards**: Enforce max sizes per section to reduce context-smuggling risk.
6. **Output constraints**: Request structured output (e.g., JSON schema) to limit prompt hijack impact.
7. **Observability**: Log risk signals and parsing failures (without exposing secrets/PII).

---

## 3) Comparative Risk Analysis (A–D)

| Approach | Security | Performance | Maintainability | UX | Overall |
|---|---|---|---|---|---|
| A: No template | Low-Medium | High | Low | Medium | ❌ Not recommended |
| B: Template + minimal safeguards | Medium | High | Medium | High | ⚠️ Acceptable only for low-risk prototypes |
| C: Template + comprehensive safeguards | High | High | High | High | ✅ Recommended default |
| D: Pre-validator LLM + insertion | Medium-High (variable) | Medium-Low | Medium | Medium | ✅ Useful as additive control, not sole control |

**Production recommendation**:
- Choose **C as baseline**.
- Add **D selectively** for flagged/high-risk payloads (risk-based routing).

---

## 4) Implementation Best Practices

## 4.1 Marking and delimiting untrusted data
Use unique, non-natural-language sentinels unlikely to appear accidentally.

Example:

```text
<<UNTRUSTED_RESPONSE_1_START>>
...verbatim untrusted text...
<<UNTRUSTED_RESPONSE_1_END>>
```

Rules:
- Never place trusted instructions inside untrusted blocks.
- Keep marker names explicit and consistent.
- Validate every start marker has a matching end marker.

## 4.2 Transformations/normalization that reduce risk
Apply deterministic transforms before interpolation:
- Normalize line endings to `\n`
- Strip disallowed control characters (retain `\n`, `\r`, `\t` if needed)
- Neutralize markdown fence breakouts when relevant to your wrapper format
- Enforce max byte/token limits per segment

Preserve fidelity by applying only structural safety transforms (not semantic rewriting).

## 4.3 Patterns to avoid
- Building prompts via ad-hoc concatenation scattered across UI code
- Relying only on “Please ignore malicious instructions” wording
- Putting secrets/API keys/client-internal instructions in prompt text
- Using `innerHTML` to display model text in UI
- Logging raw high-risk payloads in plaintext production logs

## 4.4 Deterministic and testable design
Create one central pure function for prompt assembly.

TypeScript-style pseudocode:

```ts
type BuildInput = {
  template: string;
  originalPrompt: string;
  response1: string;
  response2: string;
};

function normalize(value: string): string {
  const lineNormalized = value.replace(/\r\n?/g, "\n");
  const stripped = [...lineNormalized]
    .filter((ch) => {
      const cp = ch.charCodeAt(0);
      return cp === 0x09 || cp === 0x0a || cp === 0x0d || (cp >= 0x20 && cp !== 0x7f);
    })
    .join("");
  return stripped.replaceAll("```", "``\\`");
}

function block(marker: string, value: string): string {
  return `<<UNTRUSTED_${marker}_START>>\n${normalize(value)}\n<<UNTRUSTED_${marker}_END>>`;
}

export function buildSafeComparisonPrompt(input: BuildInput): string {
  return input.template
    .replaceAll("{{ORIGINAL_PROMPT}}", block("ORIGINAL_PROMPT", input.originalPrompt))
    .replaceAll("{{RESPONSE_1}}", block("RESPONSE_1", input.response1))
    .replaceAll("{{RESPONSE_2}}", block("RESPONSE_2", input.response2));
}
```

Test requirements:
- Deterministic output for identical input
- Marker integrity (start/end present and ordered)
- Control-char stripping behavior
- Fence-neutralization behavior
- Very long input truncation/failure policy
- Unicode edge cases

---

## 5) Residual Risk and Known Limitations

Even with comprehensive safeguards, residual risk remains:

1. **Model-level instruction-following ambiguity**: LLMs can still be influenced by adversarial text despite delimiters.
2. **Semantic attacks**: Harmful persuasion can occur without syntax tricks.
3. **Context-window pressure**: Long untrusted content can drown trusted instructions.
4. **Cross-turn contamination**: Prior conversation state may leak influence if not isolated.
5. **Validator uncertainty** (if using D): Secondary LLMs have false positives/negatives.
6. **Rendering-layer risks**: If outputs are rendered unsafely in UI, XSS-like issues can occur.

Mitigations for residual risk:
- Keep prompts stateless per request when possible
- Cap untrusted content length and summarize overflow deterministically outside the model
- Use strict output schema and server-side validation
- Add monitoring for jailbreak/injection indicators and fallback behavior

---

## Architecture Notes for Your Nuxt/Vue Context

Because your app is client-rendered, ensure security-critical operations still happen server-side:
- Keep API secrets in server runtime config only
- Perform final prompt assembly in server routes/utilities when feasible
- Treat browser-side preprocessing as convenience, not your trust boundary

If client-side assembly is required, enforce the same deterministic sanitizer and validate again server-side before forwarding to the comparison model.

---

## Final Recommendation

Adopt **Approach C** as your standard: canonical template + deterministic safe interpolation + explicit untrusted markers + normalization + boundary tests. Use **Approach D** as a targeted, additive control for risky inputs, not as a replacement for deterministic safeguards.

This gives the strongest practical balance of security, performance, maintainability, and user experience while preserving response fidelity.
