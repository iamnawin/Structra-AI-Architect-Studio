# System Architecture

ArchAI follows a distributed, event-driven architecture designed for high-compute AI workloads and responsive user interactions.

## High-Level Components

### 1. Frontend (React + Vite)
*   **UI/UX**: Step-by-step design wizard, interactive 2D canvas (Konva.js), and 3D viewer (Three.js/React Three Fiber).
*   **State Management**: Handles complex design versions and optimistic updates.

### 2. API Gateway (Express)
*   **Auth & Rate Limiting**: Managed via JWT and Redis-based throttling.
*   **Routing**: Dispatches requests to specialized microservices.

### 3. Project Service
*   **Domain Logic**: Manages projects, design versions, and user metadata.
*   **Database**: PostgreSQL (Relational data) + Redis (Caching).

### 4. AI Orchestrator
*   **Logic**: Coordinates the multi-stage AI pipeline.
*   **Tools**: Gemini 3.1 Pro for reasoning, Gemini 2.5 Flash Image for visual edits.

### 5. Blueprint Parser (Worker)
*   **Tech**: Computer Vision (OpenCV) + Gemini Vision.
*   **Output**: Vectorized wall data and room labels.

### 6. Design Generator (Worker)
*   **Logic**: Procedural floorplan generation based on constraints + LLM spatial reasoning.

### 7. 3D Model Builder & Render Worker
*   **3D Engine**: Blender (Headless) or Three.js server-side.
*   **Rendering**: Stable Diffusion (ControlNet) or specialized architectural rendering APIs.

### 8. VR Exporter
*   **Output**: glTF/GLB models for WebXR or 8K equirectangular panoramas.

## Data Flow

1.  **Input**: User submits requirements via Frontend.
2.  **Queue**: API Gateway pushes a job to the `DesignQueue` (RabbitMQ/BullMQ).
3.  **Orchestration**: AI Orchestrator picks up the job, calls Gemini for spatial planning.
4.  **Generation**: Workers generate 2D vectors -> 3D geometry -> Renders.
5.  **Storage**: Assets stored in S3; metadata in Postgres.
6.  **Notification**: WebSocket (Socket.io) notifies Frontend of completion.

## Tech Stack Recommendations

| Component | Recommended | Alternative |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind, Three.js | Vue, Babylon.js |
| **Backend** | Node.js (Express/NestJS) | Python (FastAPI) |
| **Database** | PostgreSQL (Supabase) | MongoDB |
| **AI Models** | Gemini 3.1 Pro, Gemini 2.5 Flash | GPT-4o, Claude 3.5 |
| **3D Rendering** | Blender + Stable Diffusion | Unreal Engine Pixel Streaming |
| **Queue** | BullMQ (Redis) | RabbitMQ |
