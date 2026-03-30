# Copilot Instructions

Project-specific guidance for GitHub Copilot. Keep this file updated as the codebase evolves.

## Project Overview

- **Name**: Compare OpenAI Models
- **Purpose**: Simple app that sends a user prompt to the OpenAI Responses API, shows progress while waiting, and displays the response.
- **Primary Language(s)**: TypeScript, JavaScript
- **Runtime/Framework**: Node.js, Nuxt 4, Vue 3
- **Target Environment**: Vercel

## Repo Structure

- **Entry Points**: `app/app.vue`, `app/pages/`, `server/`
- **Key Modules**: `app/components/`, `app/composables/`, `server/api/`, `server/utils/`
- **Generated Code**: `.nuxt/`, `.output/`
- **Third-Party Code**: `node_modules/`

## Build, Run, Test

- **Install**:
  - `npm install`
- **Run**:
  - `npm run dev`
- **Test**:
  - `npm test` (unit + integration)
  - `npm run test:e2e` (Playwright)
- **Lint/Format**:
  - `npm run lint` (typecheck + ESLint + Prettier check)
  - `npm run lint:fix` (auto-fix)

## Coding Standards

- **Style Guide**: Vue 3 Composition API with `<script setup lang="ts">`. See `.github/instructions/` for detailed guidelines.
- **Naming**: PascalCase for components; camelCase for composables/utilities; kebab-case for filenames.
- **Error Handling**: Wrap async calls in `try/catch`; surface user-facing errors via UI state; log errors with `console.error`.
- **Logging**: Use `console.warn`/`console.error` only; avoid `console.log` in production code.
- **Performance Considerations**: Keep server routes lean; cache model lists where possible.

## API & Data Contracts

- **Public APIs**: OpenAI Responses API (`https://api.openai.com/v1`)
- **Schemas**: Define in `types/` directory
- **Backward Compatibility**: Keep server route response shapes stable; version breaking changes

## Security & Compliance

- **Secrets Handling**: Store the OpenAI API key in a local `.env` file; ensure it is excluded from git via `.gitignore`. Use `runtimeConfig` (server-only) — never expose secrets to client-side code.
- **Input Validation**: Validate and sanitize all user input in server routes before passing to OpenAI API.
- **Dependencies**: Run `npm audit` before adding new dependencies; prefer minimal additions.

## Documentation

- **Docs Location**: `README.md` for project overview; `.github/copilot-instructions.md` for Copilot guidance
- **Changelog**: Not yet established — document significant changes in PR descriptions
- **Examples**: `scripts/` for bootstrap/utility scripts

## Workflow Preferences

- **Branching**: Feature branches off `main`; use descriptive branch names
- **Commit Style**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`)
- **PR Checklist**:
  - Typecheck passes (`npm run typecheck`)
  - Lint passes (`npm run lint`)
  - Tests pass (`npm test`)
  - `.env.example` updated if new env vars added

## Copilot Behavior Preferences

- **Do**: Prefer Nuxt 4 + Vue 3 idioms, Composition API, and TypeScript types.
- **Do**: Keep OpenAI Responses API calls in server routes or server utilities.
- **Do**: Show a loading/progress UI state while awaiting responses.
- **Do**: Use `runtimeConfig` for secrets; read `OPENAI_API_KEY` from `.env`.
- **Do**: Keep UI minimal and accessible; include clear error states for failed calls.
- **Avoid**: Exposing secrets in client code or logs.
- **Avoid**: Adding heavy dependencies unless necessary.
- **Testing**: Use Vitest for unit tests; prefer targeted tests for new logic.
- **Tooling**: Use Nuxt CLI and Vite defaults unless otherwise specified.

## Notes for This Repo

- This is a bootstrapped project. Replace `app/app.vue` placeholder with actual pages and components as the app is built out.
- Server routes that call the OpenAI API should live under `server/api/`; shared helpers under `server/utils/`.
- The `scripts/` directory contains the bootstrap script and implementation plans used to set up the repo.
