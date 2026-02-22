# API Specification

## Base URL: `/api/v1`

### Projects
*   `GET /projects`: List user projects.
*   `POST /projects`: Create a new project.
    *   Payload: `{ title: string, location: string }`
*   `GET /projects/:id`: Get project details and version history.

### Designs
*   `POST /projects/:id/versions`: Trigger a new design iteration.
    *   Payload: `{ prompt?: string, requirements?: RequirementsObject, blueprint_url?: string }`
*   `GET /versions/:id`: Get specific version data and asset status.

### Assets
*   `GET /assets/:id/download`: Get a signed URL for asset download.

### Webhooks
*   `POST /webhooks/ai-callback`: Internal endpoint for workers to report job completion.

## Example Request: Create Design Version
```json
POST /projects/proj_123/versions
{
  "prompt": "Modern 3BHK with an open kitchen and a large balcony facing East.",
  "requirements": {
    "plot_size": "30x40 ft",
    "style": "Contemporary",
    "budget_range": "50L - 70L",
    "vastu": true
  }
}
```

## Example Response
```json
{
  "version_id": "ver_456",
  "status": "queued",
  "estimated_time": "45s"
}
```
