# Compare OpenAI Models

`compare-openai-models` is a Nuxt 4 application that sends a prompt to OpenAI's Responses API and renders loading, success, and error states with accessible UI semantics.

## Features

- Model selector populated from `GET /api/models`
- Prompt validation (`trim`, required, max 4000 chars)
- Submit flow to `POST /api/respond`
- Default model fallback to `gpt-4.1-mini`
- Error normalization (`network`, `api`, `unknown`)
- Sanitized error details (redacts keys/tokens/authorization headers)
- 24-hour models response cache with stale-while-revalidate behavior
- 5-minute model-validation cache

## Requirements

- Node.js `>= 20`
- npm
- OpenAI API key

## Setup

```bash
npm install
cp .env.example .env
```

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
```

## Deployment

Target runtime is Vercel/Nitro.
Set the same environment variables in your deployment environment.
