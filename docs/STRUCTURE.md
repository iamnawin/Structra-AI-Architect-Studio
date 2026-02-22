# Project Structure Recommendation

```text
archai-monorepo/
├── apps/
│   ├── web/                # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── components/ # UI, 2D/3D Viewers
│   │   │   ├── hooks/      # AI streaming, state
│   │   │   └── services/   # API clients
│   └── api/                # Express + Node.js
│       ├── src/
│       │   ├── routes/     # REST Endpoints
│       │   ├── services/   # Business Logic
│       │   └── orchestrator/# AI Pipeline Logic
├── packages/
│   ├── types/              # Shared TS interfaces
│   ├── ai-core/            # Gemini SDK wrappers, prompts
│   └── spatial-utils/      # Geometry & Vector math
├── workers/
│   ├── blueprint-parser/   # Python/Node (OpenCV)
│   ├── render-engine/      # Blender/Stable Diffusion
│   └── exporter/           # PDF/glTF generation
├── infra/
│   ├── docker/             # Container configs
│   └── terraform/          # Cloud resources (AWS/GCP)
└── docs/                   # Architecture & Design Docs
```
