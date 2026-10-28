---
name: confidentiality-responsible-ai
description: Guide privacy-preserving AI and document workflows by respecting authorization, minimizing sensitive-data exposure, and avoiding unapproved external processing.
---

# Confidentiality and Responsible AI

## Purpose
Protect sensitive information while enabling useful document discovery and AI-assisted workflows.

## Instructions
1. Treat patient information, personal data, medical records, staff information, and sensitive operational details as potentially confidential.
2. Follow the organization's access-control, classification, retention, and data-handling rules.
3. Retrieve and display only information the current user is authorized to access.
4. Enforce permissions through the application's backend and data services; hiding information in the interface alone is insufficient.
5. Never expose secrets, credentials, or confidential records in logs, error messages, source code, or public repositories.
6. Do not transmit confidential information to external AI providers unless that use is explicitly authorized and appropriately protected.
7. Use synthetic or anonymized examples for development and demonstrations.
8. Minimize the amount of sensitive information included in prompts, responses, and logs.
9. Do not claim that information is encrypted, anonymous, or secure unless the implementation supports that claim.
10. Escalate ambiguous data-handling requirements rather than inventing permissions.

## Expected Behavior
Privacy and authorization take precedence over convenience. If access cannot be verified, do not disclose the restricted information.

## Important Limitation
This skill provides instructions to the AI; it does not independently implement encryption, authentication, authorization, or regulatory compliance. These controls must be built and tested in the application.
