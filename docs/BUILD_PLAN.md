# How to Start Building Structra as a Full Working App

## 1) What the app means (product in one line)

Structra is an **AI architecture copilot** that converts user requirements (and optional blueprint uploads) into iterative design outputs: plan data, renders, and export artifacts.

## 2) Current working baseline in this repo

- Frontend landing experience (React + Vite).
- New API skeleton with persistent project storage (`better-sqlite3`):
  - `GET /api/v1/health`
  - `GET /api/v1/projects`
  - `POST /api/v1/projects`
  - `GET /api/v1/pipeline/status`
- Frontend MVP Kickoff Console that creates and lists projects against the API.

## 3) Run full stack locally

```bash
npm install
npm run dev:api
npm run dev
```

Open `http://localhost:3000` and use the **MVP Kickoff Console** section.

## 4) Build order (recommended)

1. **Project lifecycle**
   - Add project detail page and `GET /api/v1/projects/:id`.
2. **Requirements intake wizard**
   - Capture rooms, budget, style, constraints.
3. **Versioning model**
   - Add `design_versions` table and `/projects/:id/versions` endpoint.
4. **AI orchestration stub**
   - Create service layer that turns inputs into deterministic mock outputs.
5. **Prompt + model integration**
   - Connect to Gemini via `@google/genai` with strict JSON outputs.
6. **Asset generation pipeline**
   - Add async queue worker and persistent asset metadata.
7. **Export + observability**
   - Add PDF export endpoint, request IDs, and structured logs.

## 5) Definition of done for MVP

- User can create project.
- User can submit requirements.
- System produces one saved concept version (layout summary + preview image URL).
- User can view version history and export one PDF summary.
