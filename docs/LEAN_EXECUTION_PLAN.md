# Lean Execution Plan (Low Investment, Full Stage Coverage)

This plan is optimized for **minimum spend + maximum learning**, while still ensuring the app works through every major stage (intake → generation → iteration → export).

## Core strategy

1. Build one thin vertical slice end-to-end.
2. Keep every subsystem replaceable (especially AI provider).
3. Use mock/fallback modes first, then turn on paid providers gradually.
4. Add basic test harness now, swap frameworks later without rewriting business logic.

---

## Stage map (what must work)

- **Stage 1: Intake** (project + requirements input)
- **Stage 2: Generation** (create version from requirements)
- **Stage 3: Iteration** (modify existing version)
- **Stage 4: Assets** (preview URLs + metadata)
- **Stage 5: Export** (basic PDF summary download)
- **Stage 6: Observability** (status, logs, failure reason)

For current budget constraints, each stage should ship with a **mock-first** implementation and a provider-backed implementation behind a feature flag.

---

## Delivery phases

## Phase A (Week 1) — Stabilize MVP core

### Backend
- [ ] Add `GET /api/v1/projects/:id`
- [ ] Add `POST /api/v1/projects/:id/requirements`
- [ ] Add `GET /api/v1/projects/:id/requirements`
- [ ] Add `POST /api/v1/projects/:id/versions`
- [ ] Add `GET /api/v1/projects/:id/versions`
- [ ] Add migration file structure (`server/migrations/`)

### Frontend
- [ ] Add project detail page
- [ ] Add requirements form (plot, rooms, style, budget)
- [ ] Add generate-version button + status chip
- [ ] Add versions list

### Done means
- [ ] User can create project → submit requirements → generate a mock version and see it in UI.

---

## Phase B (Week 2) — Provider abstraction and cost control

### AI provider layer
- [ ] Introduce `AiProvider` interface (`generatePlan`, `generateRenderPrompt`, `estimateBOQ`)
- [ ] Add `GeminiProvider` implementation
- [ ] Add `MockProvider` implementation
- [ ] Add env switch: `AI_PROVIDER=mock|gemini`
- [ ] Add hard timeout + retry cap for provider calls

### Cost guardrails
- [ ] Add token/request budget per project/day
- [ ] Add max-generation frequency throttle
- [ ] Persist provider usage logs

### Done means
- [ ] App works entirely in `mock` mode and optionally in `gemini` mode with identical output schema.

---

## Phase C (Week 3) — Export and operational basics

### Export
- [ ] Add `GET /api/v1/versions/:id/export.pdf`
- [ ] Generate minimal PDF: project info + requirements + selected version summary

### Reliability
- [ ] Add request IDs and structured logs
- [ ] Add unified error format
- [ ] Add health checks for DB and provider mode

### Done means
- [ ] User can generate version and download a simple PDF summary.

---

## Phase D (Week 4) — Test framework-ready baseline

### Tests now (minimal)
- [ ] Unit tests for validators + provider adapter
- [ ] API integration tests for project/requirements/version lifecycle
- [ ] One smoke E2E test (create project -> generate -> export)

### Framework-neutral design
- [ ] Keep domain/service logic framework-agnostic (`server/src/services`)
- [ ] Keep HTTP layer thin (`routes` only)
- [ ] Document migration path to NestJS/FastAPI if needed

### Done means
- [ ] We can swap framework with limited rewrite because business logic is isolated.

---

## Provider strategy (Gemini now, optional later)

Use Gemini as the initial provider for speed, but do not couple app logic to SDK types.

- Normalize provider responses into internal DTOs.
- Validate all AI output with schemas before DB writes.
- Keep prompts versioned in `prompts/`.

When ready to test another framework/provider later, only provider adapter + route wiring should change.

---

## Minimum schema additions

- `project_requirements`
  - `project_id`, `plot_size`, `rooms_json`, `style`, `budget_range`, `constraints_json`, timestamps
- `design_versions`
  - `project_id`, `version_no`, `status`, `summary_json`, `provider`, `cost_estimate`, timestamps
- `exports`
  - `version_id`, `type`, `path_or_url`, `status`, timestamps

---

## Risks and mitigations

- **Risk:** Gemini cost spike
  - **Mitigation:** default to mock mode in dev + budgets + throttles.
- **Risk:** Slow generation pipeline
  - **Mitigation:** async jobs and immediate queued status.
- **Risk:** framework rewrite later
  - **Mitigation:** isolate domain logic now.

---

## Immediate next 5 tasks (start now)

1. Implement `GET /projects/:id`.
2. Add requirements table + endpoints.
3. Add version table + `POST /projects/:id/versions` returning mock output.
4. Add project detail UI with requirements form.
5. Add one integration test for full API lifecycle.

