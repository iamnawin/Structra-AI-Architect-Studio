# Security & Privacy

## Data Classification
*   **PII**: User email, name, billing info.
*   **Sensitive**: User property blueprints, location data, budget.
*   **Public**: Anonymous design templates (if shared).

## Storage Strategy
*   **Database**: Encrypted at rest (AES-256).
*   **File Storage**: S3 buckets with private access. Signed URLs used for temporary client access.
*   **Retention**: User data retained for the duration of the account. Blueprints deleted 30 days after project completion unless opted-in for "Design Training" (anonymized).

## Authentication
*   OAuth 2.0 (Google/GitHub) + Magic Links.
*   Role-Based Access Control (RBAC): User, Architect (Reviewer), Admin.

## Compliance
*   GDPR/CCPA compliant data deletion requests.
*   Clear disclaimers: "AI-generated designs are for conceptual use only. Consult a licensed structural engineer before construction."
