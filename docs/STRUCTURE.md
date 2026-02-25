# Project Structure (Current + Next)

## Current repository structure

```text
.
├── docs/                  # Product, architecture, API, roadmap documentation
├── prompts/               # Prompt templates for AI workflow stages
├── src/
│   ├── components/
│   │   └── landing/       # Landing page sections
│   ├── data/              # Static content/config for UI sections
│   ├── App.tsx            # App composition root
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## Near-term target structure (single-repo, pragmatic)

```text
.
├── docs/
├── prompts/
├── server/
│   └── src/
│       ├── routes/
│       ├── services/
│       └── db/
├── src/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── data/
│   └── types/
└── ...
```

## Long-term target (optional monorepo)

```text
structra-monorepo/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── types/
│   ├── ai-core/
│   └── spatial-utils/
├── workers/
└── infra/
```

This staged approach avoids over-engineering now while preserving a clean path to a monorepo when backend workers and shared packages become real.
