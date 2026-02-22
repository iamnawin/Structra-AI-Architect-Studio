# Domain Model

## Entities

### Project
*   `id`: UUID
*   `owner_id`: UUID
*   `title`: String
*   `location`: Geography (lat/lng)
*   `created_at`: Timestamp
*   `status`: Enum (Draft, Processing, Completed)

### DesignVersion
*   `id`: UUID
*   `project_id`: UUID
*   `parent_version_id`: UUID (Self-reference for branching)
*   `prompt`: String (The user instruction that created this version)
*   `metadata`: JSON (Plot size, rooms, budget, style)
*   `spatial_data`: JSON (Vector floorplan: walls, windows, doors)
*   `assets`: JSON (Links to renders, 3D models, PDF plans)

### Asset
*   `id`: UUID
*   `version_id`: UUID
*   `type`: Enum (Render, Floorplan_PDF, Model_3D, Panorama_VR)
*   `url`: String
*   `status`: Enum (Pending, Ready, Failed)

### User
*   `id`: UUID
*   `email`: String
*   `subscription_tier`: Enum (Free, Pro, Enterprise)

## Relations
*   A **Project** has many **DesignVersions**.
*   A **DesignVersion** has many **Assets**.
*   A **DesignVersion** can have one **ParentVersion** (forming a tree/history).

## Invariants
*   A `DesignVersion` must have a valid `spatial_data` before high-fidelity `Assets` can be generated.
*   Total area in `spatial_data` cannot exceed `plot_size` defined in `metadata`.
