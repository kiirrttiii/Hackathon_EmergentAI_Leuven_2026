# AGENTS.md — AI Development Instructions

## 1. Understand Before Implementing

- Read `README.md` and `TECHNICAL_SCAFFOLDING.md` before making architectural decisions.
- Read `DATA.md` before implementing data ingestion, search, or AI functionality.
- Identify assumptions and unresolved requirements instead of silently inventing answers.
- Use Plan mode for significant features, explain the proposed approach, and identify risks before implementation.

## 2. Protect the Core Requirements

Always prioritize:

- Confidentiality and appropriate access controls
- Reliable access to source documents
- Accurate document status and version information
- Offline availability of essential functions
- Fast retrieval and a simple user experience
- Maintainability and cost efficiency

Do not introduce a cloud dependency into a core workflow without explaining why it is necessary.

## 3. AI Reliability

- Ground answers in retrieved documents whenever answering organization-specific questions.
- Display the source document and, where possible, the relevant page or section.
- Never fabricate citations, document contents, approval status, or dates.
- Distinguish approved guidance from drafts, archived content, and unverified material.
- Explicitly communicate insufficient evidence and conflicting sources.
- Never present generated output as a replacement for authorized clinical protocols or professional judgment.

## 4. Data Protection

- Use synthetic or appropriately anonymized data for development and demonstrations.
- Never commit credentials, API keys, patient records, or confidential documents to GitHub.
- Do not transmit sensitive data to external services without explicit authorization and an approved data-handling approach.
- Enforce document access permissions in the backend, not only in the user interface.
- Do not claim that encryption, authentication, or other security controls exist unless they are implemented and tested.

## 5. Coding Standards

- Use the stack documented in `TECHNICAL_SCAFFOLDING.md` unless a change is justified and agreed upon.
- Prefer small, modular, readable components and functions.
- Avoid unnecessary dependencies and overengineering.
- Reuse existing components and patterns where appropriate.
- Handle invalid files, missing data, network failures, and unavailable AI services gracefully.
- Keep documentation and setup instructions synchronized with implementation.

## 6. Testing and Validation

- Test important behavior after each significant change.
- Verify that document search and citations refer to actual source content.
- Test conflicting and outdated documents.
- Test unauthorized access and failure scenarios.
- Check that essential local functions continue to work when internet access is unavailable.
- Report known limitations honestly.

## 7. Implementation Workflow

1. Understand the requirement and affected components.
2. Propose a concise implementation plan.
3. Identify assumptions, dependencies, and risks.
4. Implement the smallest useful solution.
5. Run relevant tests and review the result.
6. Summarize changes, test outcomes, and remaining limitations.

Do not rebuild functioning parts of the application without a clear reason.