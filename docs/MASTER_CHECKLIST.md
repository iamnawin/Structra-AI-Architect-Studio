# Structra Full-App Master Checklist

Use this as the single execution checklist to turn Structra from MVP scaffold into a production-ready AI architecture platform.

---

## How to use this file

- Mark items with `[x]` only when merged and verified.
- Add a link to PR/commit next to each completed item.
- Do not skip acceptance criteria; treat them as definition-of-done.
- If scope changes, update this file first.

---

## 0) Project Controls & Foundations

### 0.1 Product definition
- [ ] Freeze MVP scope (inputs, outputs, and constraints).
- [ ] Define non-goals for MVP.
- [ ] Write primary user personas (homeowner, architect, developer).
- [ ] Define user journeys (new project, iterate design, export assets).

**Acceptance criteria**
- [ ] MVP scope and non-goals documented in `docs/` and approved.

### 0.2 Engineering standards
- [ ] Add `CONTRIBUTING.md` (branching, commit style, PR template).
- [ ] Add codeowners/review ownership model.
- [ ] Add formatting/linting enforcement in CI.
- [ ] Add issue templates (bug, feature, spike).

**Acceptance criteria**
- [ ] Every PR runs lint/build/tests and blocks on failure.

### 0.3 Environments
- [ ] Define local, staging, production environment contracts.
- [ ] Document required env variables and secret strategy.
- [ ] Add `.env.example` coverage for all required vars.

**Acceptance criteria**
- [ ] New developer can boot full stack via docs in <30 min.

---

## 1) Backend Core (API + DB)

### 1.1 Data model
- [ ] Finalize DB schema for:
  - [ ] `projects`
  - [ ] `project_requirements`
  - [ ] `design_versions`
  - [ ] `assets`
  - [ ] `jobs`
  - [ ] `events`/audit log
- [ ] Add migration mechanism (versioned SQL migrations).
- [ ] Add seed data for local development.

**Acceptance criteria**
- [ ] Schema migrations are repeatable and rollback-safe.

### 1.2 API endpoints (v1)
- [ ] `GET /api/v1/health`
- [ ] `GET /api/v1/projects`
- [ ] `POST /api/v1/projects`
- [ ] `GET /api/v1/projects/:id`
- [ ] `PATCH /api/v1/projects/:id`
- [ ] `POST /api/v1/projects/:id/requirements`
- [ ] `GET /api/v1/projects/:id/requirements`
- [ ] `POST /api/v1/projects/:id/versions`
- [ ] `GET /api/v1/versions/:id`
- [ ] `GET /api/v1/projects/:id/versions`
- [ ] `POST /api/v1/versions/:id/assets`
- [ ] `GET /api/v1/assets/:id/download`
- [ ] `GET /api/v1/pipeline/status`

**Acceptance criteria**
- [ ] OpenAPI spec exists and matches implementation.
- [ ] Endpoint-level validation + error codes are standardized.

### 1.3 Service structure
- [ ] Split API into `routes/`, `services/`, `repositories/`, `validators/`.
- [ ] Add request ID middleware.
- [ ] Add centralized error handling.
- [ ] Add structured logging.

**Acceptance criteria**
- [ ] No DB access directly inside route handlers.

---

## 2) Frontend Product Flows

### 2.1 App shell & routing
- [ ] Introduce route-based pages (dashboard, project detail, version detail, exports).
- [ ] Add global state/query strategy (React Query or equivalent).
- [ ] Add API client layer + typed DTOs.

**Acceptance criteria**
- [ ] Navigation supports complete MVP journey end-to-end.

### 2.2 Intake wizard
- [ ] Build stepper for plot, rooms, budget, style, constraints.
- [ ] Add validation and recoverable drafts.
- [ ] Persist intake data to backend.

**Acceptance criteria**
- [ ] User can save and resume intake with no data loss.

### 2.3 Concept/version workflow
- [ ] Trigger new concept generation from UI.
- [ ] Show generation states (queued/running/completed/failed).
- [ ] Render version cards with metadata.
- [ ] Add version comparison view.

**Acceptance criteria**
- [ ] User can create and view at least 3 versions per project.

### 2.4 Asset & export UI
- [ ] Show 2D plan preview.
- [ ] Show render preview(s).
- [ ] Show VR link/panorama placeholder.
- [ ] Add export actions (PDF/GLTF placeholders initially).

**Acceptance criteria**
- [ ] Export actions available from version detail page.

---

## 3) AI Pipeline & Orchestration

### 3.1 Pipeline contract
- [ ] Define canonical input/output JSON schema for each stage:
  - [ ] Intake normalization
  - [ ] Spatial plan generation
  - [ ] Design variation generation
  - [ ] Render prompt generation
  - [ ] BOQ estimation
- [ ] Add strict schema validation on all AI outputs.

**Acceptance criteria**
- [ ] No unvalidated AI output enters persistent storage.

### 3.2 Prompt system
- [ ] Version prompts in `prompts/` with metadata (owner, purpose, version).
- [ ] Add prompt test cases for deterministic checks.
- [ ] Add fallback prompts for failure conditions.

**Acceptance criteria**
- [ ] Prompt changes are reviewed and diffed like code.

### 3.3 Job execution
- [ ] Introduce queue worker (BullMQ/RabbitMQ).
- [ ] Add job retry/backoff policy.
- [ ] Add dead-letter handling.
- [ ] Add webhook/event callback integration.

**Acceptance criteria**
- [ ] Failed jobs surface actionable reason in UI/API.

---

## 4) Files, Storage, and Assets

- [ ] Decide asset storage strategy (local dev + cloud prod).
- [ ] Implement signed URL strategy for downloads.
- [ ] Add file upload validation (type/size/scanning hooks).
- [ ] Add lifecycle policy for stale temporary assets.

**Acceptance criteria**
- [ ] Asset access is authorized and auditable.

---

## 5) Security, Privacy, and Compliance

### 5.1 Access control
- [ ] Add authentication (JWT/session).
- [ ] Add authorization checks per project/version.
- [ ] Add role model (owner/editor/viewer).

### 5.2 App security
- [ ] Add input validation everywhere.
- [ ] Add rate limiting and abuse controls.
- [ ] Add security headers and CORS policy.
- [ ] Add dependency vulnerability scanning.

### 5.3 Privacy controls
- [ ] Define data retention policy.
- [ ] Define PII handling and masking policy.
- [ ] Add delete/export data workflows.

**Acceptance criteria**
- [ ] Security/privacy checklist in `docs/SECURITY_PRIVACY.md` is fully mapped to implementation.

---

## 6) Observability & Quality

### 6.1 Observability
- [ ] Add structured logs with request correlation IDs.
- [ ] Add metrics (latency, errors, queue depth, job durations).
- [ ] Add basic traces for API + worker flows.
- [ ] Add alerts for failure thresholds.

### 6.2 Testing strategy
- [ ] Unit tests (services, validators, parsers).
- [ ] Integration tests (API + DB).
- [ ] E2E tests (intake -> version -> export).
- [ ] Contract tests for AI schema outputs.

**Acceptance criteria**
- [ ] CI gates on unit + integration + smoke E2E.

---

## 7) Performance & Reliability

- [ ] Set performance budgets (API p95 latency, build size, render time SLA).
- [ ] Add caching strategy for expensive reads.
- [ ] Add idempotency keys for create/generate endpoints.
- [ ] Add graceful degradation when AI provider is unavailable.

**Acceptance criteria**
- [ ] MVP withstands expected concurrent load target.

---

## 8) DevOps & Release

- [ ] Containerize web + API + worker.
- [ ] Add CI pipeline (lint/test/build/security scan).
- [ ] Add CD pipeline to staging.
- [ ] Add migration-on-deploy workflow.
- [ ] Add rollback plan.

**Acceptance criteria**
- [ ] One-command deploy to staging with health verification.

---

## 9) Documentation & Enablement

- [ ] Keep `docs/API_SPEC.md` synchronized with OpenAPI.
- [ ] Add architecture decision records (ADR) for major choices.
- [ ] Add runbooks:
  - [ ] Incident response
  - [ ] AI provider outage
  - [ ] Queue backlog recovery
- [ ] Add onboarding guide for contributors.

**Acceptance criteria**
- [ ] New contributor can complete first production task using docs only.

---

## 10) MVP Exit Checklist (Release Gate)

- [ ] User can create and manage projects.
- [ ] User can submit requirements and generate versions.
- [ ] User can view saved outputs and download export.
- [ ] API and worker failures are observable and recoverable.
- [ ] Security baseline (auth, validation, rate limiting) is active.
- [ ] CI/CD and staging release process are stable.
- [ ] Product analytics events are captured for core funnel.

**Release decision**
- [ ] Approved for MVP launch
- [ ] Blocked (list blockers here):
  - [ ] Blocker 1
  - [ ] Blocker 2

---

## Progress Snapshot

- Overall completion: `0%`
- Last updated: `YYYY-MM-DD`
- Owner: `TBD`

