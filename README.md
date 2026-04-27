# Compare OpenAI Models

`compare-openai-models` is a Nuxt 4 application that sends one prompt to two selected OpenAI models and renders independent side-by-side loading, success, and error states with accessible UI semantics.

## Features

- Two active model selectors (`Model 1` and `Model 2`) populated from `GET /api/models`
- Prompt validation (`trim`, required, max 4000 chars)
- Single send action that triggers two `POST /api/respond` requests (one per selected model)
- Independent per-panel response states, so one side can complete while the other is still loading
- Default model fallback to `gpt-4.1-mini`
- Error normalization (`network`, `api`, `unknown`)
- Sanitized error details (redacts keys/tokens/authorization headers)
- 24-hour models response cache with stale-while-revalidate behavior
- 5-minute model-validation cache

## Requirements

- Node.js `24`
- npm
- OpenAI API key

## Setup

```bash
npm install
npm run setup:playwright
cp .env.example .env
```

The Playwright setup command uses a fallback strategy:

- first: `playwright install --with-deps chromium`
- fallback on failure: `playwright install chromium`

Configure `.env`:

```dotenv
OPENAI_API_KEY=sk_your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_ALLOWED_HOSTS=api.openai.com
OPENAI_ALLOW_INSECURE_HTTP=false
OPENAI_DISABLE_MODELS_CACHE=false
OPENAI_DISABLE_MODEL_VALIDATION_CACHE=false
```

## Run

```bash
npm run dev
```

App starts on `http://127.0.0.1:3000`.

## API Endpoints

- `GET /api/models`
  - Proxies upstream `/models`
  - Applies optional local filtering from `server/assets/models/openai-models.json`
  - Returns `usedConfigFilter` and `showFallbackNote` metadata

- `POST /api/respond`
  - Accepts `{ prompt: string, model?: string }`
  - Validates prompt server-side
  - Validates selected model against upstream models list
  - Sends to OpenAI `/responses`
  - Returns `{ response, model }`

## Tests and Quality Gates

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:a11y
```

Useful shortcuts:

```bash
npm test
npm run test:a11y:unit
npm run test:a11y:e2e
npm run setup:playwright
```

## Test Architecture

- Unit tests live in `tests/unit` and focus on component/composable behavior, state transitions, and accessibility semantics.
- Integration tests live in `tests/integration` and validate route-handler contracts for `GET /api/models` and `POST /api/respond`.
- Route-level integration helpers are in `tests/integration/helpers/route-harness.ts` (runtime config mocking, `readBody` mocking, route loading).
- E2E tests live in `tests/e2e` and verify browser flows for happy-path, model-loading states, retry/error handling, and fallback note visibility.
- Shared Playwright API mocks are in `tests/e2e/helpers/mock-api.ts`.

When adding tests, prefer deterministic network mocking and role/label-based selectors to keep suites stable and accessible.

## Deployment

Target runtime is Vercel/Nitro.
Set the same environment variables in your deployment environment.
