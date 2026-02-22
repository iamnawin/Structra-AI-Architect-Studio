# Observability

## Logging
*   **Application Logs**: Structured JSON logs (Winston/Pino) sent to ELK stack or Datadog.
*   **AI Traceability**: Log every prompt, response, and token usage per `version_id`.

## Metrics
*   **Performance**: Time-to-first-preview (TTFP), total generation time.
*   **Business**: Conversion rate from intake to export, average iterations per project.
*   **Cost**: Real-time tracking of Gemini API costs per user.

## Tracing
*   Distributed tracing (OpenTelemetry) to track a request from Frontend -> API -> Worker -> AI Model.

## Error Handling
*   Sentry for frontend/backend crash reporting.
*   Dead Letter Queues (DLQ) for failed AI generation jobs.
