# Structra Project Audit (Current Baseline)

## What exists today

- **A polished single-page landing UI** built with React + Vite + Tailwind + Motion.
- **Strong product vision docs** covering architecture, domain model, API spec, security, and roadmap.
- **Prompt assets** for iterative AI workflows in `prompts/`.

## Key findings

1. **Codebase is currently front-end only in implementation**
   - There is no server/app logic implemented yet, despite the presence of API and pipeline documentation.
2. **Dependency intent and implemented surface are misaligned**
   - `express`, `dotenv`, and `better-sqlite3` are already in `package.json`, but no backend source directories use them.
3. **Naming and structure still look like a prototype**
   - Package name is `react-example`.
   - A previous monorepo recommendation exists in docs, but actual repository layout is still flat.
4. **UI composition was monolithic before this restructure pass**
   - `src/App.tsx` contained all sections and content in one file, slowing future iteration.

## Restructure completed in this pass

- Refactored landing page into focused components:
  - `Navigation`, `HeroSection`, `FeaturesSection`, `WorkflowSection`, `Footer`.
- Moved reusable copy/data into `src/data/landingContent.ts` for easier iteration.
- Kept visual output unchanged while making the code modular and ready for feature growth.

## Recommended next restructure (Phase 1)

1. **Create app boundaries in-place (without full monorepo migration yet)**
   - Add `src/features/` for domain-specific UI flows (intake, concept generation, export).
   - Add `src/lib/` for shared utilities, API client, and config.
2. **Add backend skeleton in `server/`**
   - Start with `/health`, `/projects`, and `/pipeline/status` routes.
   - Wire environment handling and a SQLite adapter.
3. **Align naming and metadata**
   - Rename package to `structra-ai-architect-studio`.
   - Add a root `CONTRIBUTING.md` with conventions.
4. **Define the first thin vertical slice**
   - Intake form -> store project -> return generated concept stub.

## Why this helps

This keeps momentum high: minimal disruption now, but creates clear seams for the first real product slice across UI + API + AI orchestration.
