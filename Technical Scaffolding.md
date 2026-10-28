# Technical Scaffolding — D4GC Hackathon

## 1. Project Overview

**Project type:** AI-powered information management and decision-support application

**Target organization:** An international independent medical humanitarian organization operating in low-resource and emergency settings.

### Problem statement

The organization generates and receives large volumes of documents, presentations, research publications, medical protocols, operational manuals, and datasets. Staff need to identify reliable, relevant, and up-to-date information quickly to make informed decisions.

However, poor document lifecycle management, fragmented information, inconsistent versions, limited internet connectivity, varying digital literacy, and strict confidentiality requirements make it difficult to find and trust the right information.

### Technical objective

Build a prototype that helps staff access, organize, evaluate, and use organizational knowledge efficiently, while remaining secure, maintainable, affordable, and resilient in low-resource environments.

The solution must be designed for field conditions rather than assuming continuous internet access, powerful hardware, or advanced digital skills.

## 2. Technical Principles

The application should follow these principles:

1. **Offline-first:** Core functionality should remain available when internet access is interrupted.
2. **Privacy by design:** Confidential medical, operational, and personal information must be protected.
3. **Source-grounded AI:** AI-generated answers must reference the underlying documents and distinguish verified information from uncertainty.
4. **Fast access:** Staff should be able to retrieve critical information with minimal steps and delay.
5. **Low-resource compatibility:** The application should function on modest hardware and unreliable networks.
6. **Accessible interface:** The interface should support users with different levels of digital literacy.
7. **Maintainability:** The architecture should be modular, documented, and easy to maintain over multiple years.
8. **Cost efficiency:** Prefer open-source technologies and lightweight infrastructure where practical.
9. **Resilience:** The application should recover gracefully from network failures, interrupted operations, and device restarts.

## 3. Proposed Technology Stack

The following is a provisional stack for the hackathon prototype. The final selection should be validated against the actual use case and the AI coding tool's supported technologies.

| Layer | Proposed technology | Purpose |
|---|---|---|
| AI development tool | Bolt | Generate and iterate on the application |
| Frontend | React + TypeScript | Build a responsive, interactive user interface |
| UI styling | Tailwind CSS | Create a consistent, accessible interface |
| Backend | Python + FastAPI | Implement document processing, search, and application logic |
| Database | SQLite for the local prototype | Store document metadata, versions, and local records |
| Document storage | Local file storage for the prototype | Store uploaded documents and extracted text |
| Search | SQLite full-text search (FTS5) | Search document contents without relying on external services |
| AI integration | Pluggable language-model interface | Support grounded question answering when an approved model is available |
| Version control | Git + GitHub | Track code changes and support team collaboration |
| Documentation | Markdown | Maintain project instructions and technical documentation |
| Deployment | Local deployment initially | Demonstrate operation without requiring a permanent cloud service |

**Important:** This is a proposed starting point, not a confirmed production architecture. The hackathon prototype should avoid unnecessary infrastructure until the core user problem is validated.

## 4. High-Level Architecture

The application should separate the user interface, document management, search, AI processing, and storage.

User → Web interface → Application backend → Document and search services → Local database and file storage

The AI layer should be optional and replaceable:

- When an approved local AI model is available, sensitive processing can potentially remain on-site.
- When an approved remote model is available, the application may use it only under the organization's data protection rules.
- When AI is unavailable, core document browsing and keyword search should continue to work.

AI responses should be generated from authorized documents rather than presented as independent medical or operational authority.

## 5. Core Functional Modules

### 5.1 Document ingestion

- Support common formats such as PDF, DOCX, TXT, and Markdown.
- Extract searchable text and document metadata.
- Record the document title, source, author or owner where available, creation date, last-modified date, and version.
- Detect potential duplicates.
- Identify documents that cannot be processed and explain why.

### 5.2 Document lifecycle management

- Track document status: draft, under review, approved, superseded, or archived.
- Preserve document versions and change history.
- Record review dates and designated owners where available.
- Flag outdated documents and conflicting versions.
- Make the currently approved version easy to identify.
- Keep archived documents available only according to access permissions and retention rules.

### 5.3 Search and discovery

- Provide full-text search across authorized documents.
- Support filters for document type, topic, date, status, and source.
- Rank results by relevance while making document status and recency visible.
- Allow users to open the original document from search results.
- Keep search available when disconnected from the internet, using locally available content.

### 5.4 AI-assisted information retrieval

- Allow users to ask natural-language questions about organizational documents.
- Retrieve relevant passages before generating an answer.
- Display citations linking to the source document and, where possible, the exact page or section.
- Distinguish between approved guidance, draft material, archived material, and unverified sources.
- Clearly indicate when the available evidence is insufficient or contradictory.
- Avoid inventing missing facts or presenting uncertain answers as established guidance.

### 5.5 Offline operation and synchronization

- Store authorized documents and indexes locally.
- Make essential functions available without a network connection.
- Clearly indicate whether the user is online, offline, or synchronizing.
- Queue permitted changes for later synchronization.
- Detect conflicting updates instead of silently overwriting documents.
- Recover safely after interrupted synchronization or unexpected shutdowns.

Offline availability should be configurable: not every document should automatically be copied onto every device.

### 5.6 Access control and security

- Apply role-based access permissions.
- Restrict access to confidential documents and sensitive functions.
- Protect stored files and local databases using appropriate encryption and operating-system security controls.
- Avoid sending confidential information to unapproved external AI services.
- Maintain audit logs for important access and modification events.
- Define document retention, deletion, backup, and recovery procedures.
- Use synthetic or anonymized data during the hackathon demonstration.

### 5.7 User experience and accessibility

- Provide a simple search-first interface.
- Use clear language, visible document status, and recognizable icons.
- Minimize the number of steps needed to retrieve critical information.
- Support responsive layouts and modest screen sizes.
- Provide clear error messages and feedback during long-running tasks.
- Design the prototype so that users can learn its main functions with minimal training.

## 6. Non-Functional Requirements

| Requirement | Expected behavior |
|---|---|
| Performance | Common local searches should return results quickly; measure and report actual response times. |
| Availability | Core local functions should work without internet access. |
| Security | Unauthorized users must not be able to access restricted documents. |
| Accuracy | AI answers must be traceable to sources, with uncertainty and conflicts disclosed. |
| Maintainability | Separate modules, document interfaces, and provide setup instructions. |
| Portability | Support deployment on suitable local hardware without mandatory cloud dependencies. |
| Resource usage | Avoid unnecessary background processing and excessive memory consumption. |
| Scalability | Keep storage and search components replaceable as document collections grow. |
| Reliability | Handle corrupt files, failed imports, interrupted operations, and unavailable AI services gracefully. |

Performance thresholds and supported hardware should be established after testing with representative documents and target devices.

## 7. Development and Repository Structure

Use the following proposed structure:

```text
ngo-knowledge-assistant/
├── README.md
├── TECHNICAL_SCAFFOLDING.md
├── AGENTS.md
├── DATA.md
├── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── document_processing/
│   │   ├── search/
│   │   ├── ai/
│   │   ├── security/
│   │   └── database/
│   └── requirements.txt
├── tests/
│   ├── frontend/
│   └── backend/
└── docs/
    ├── architecture.md
    ├── security.md
    └── deployment.md
```

This structure is a guide rather than a requirement to create every folder immediately. Bolt should implement only the components needed for the agreed prototype.

## 8. Development Workflow

1. Define the problem, primary users, and the most important user journey.
2. Inspect the available sample data and identify privacy constraints.
3. Ask the AI coding tool to propose an implementation plan.
4. Review the plan before allowing code generation.
5. Implement a small end-to-end workflow.
6. Test document ingestion, retrieval, source attribution, permissions, and offline behavior.
7. Collect feedback from representative users.
8. Iterate, document known limitations, and prepare a reproducible demo.

Use Git branches or commits to preserve working versions and make team contributions traceable.

## 9. Testing Strategy

The prototype should be tested against realistic failure scenarios:

- The same document exists in multiple versions.
- Two documents contain conflicting guidance.
- A document is outdated or not yet approved.
- The requested information does not exist.
- A user tries to access a restricted document.
- The network disconnects during a search or update.
- An imported file is corrupted or unreadable.
- The AI service is unavailable.
- The local machine restarts unexpectedly.

AI answers should be checked for source relevance, citation accuracy, unsupported claims, and appropriate handling of uncertainty.

## 10. Hackathon Scope

Prioritize a working demonstration of the core value rather than implementing the entire production system.

**Proposed minimum viable prototype:**

1. Import a small collection of representative documents.
2. Display document metadata and lifecycle status.
3. Search document contents locally.
4. Ask a question and receive an answer grounded in retrieved documents.
5. Display source citations and highlight potentially outdated or conflicting material.
6. Demonstrate core search and document access without internet connectivity.

Authentication, enterprise-scale synchronization, production encryption, and integration with existing organizational systems should be implemented or validated only to the extent possible within the hackathon. Any unimplemented security controls must be documented rather than assumed to exist.

## 11. Key Decisions Still to Be Validated

Before committing to a production design, clarify:

- Who are the primary users, and what decisions are they trying to make?
- Which document types and repositories are currently used?
- How is the authoritative or approved version of a document determined?
- What hardware and operating systems are available in the field?
- How long must the application operate without internet access?
- Which data classifications and access restrictions apply?
- Are local AI models available, and what hardware can run them?
- What are the expected document volumes, response-time targets, and budget?
- Does the organization already have identity management, backup, and synchronization systems?

These answers should guide the final architecture rather than assuming a cloud-first or AI-first design.

## 12. Definition of Success

The prototype succeeds if a representative user can find relevant, trustworthy, current information faster and with greater confidence than through the existing document workflow, including in a low-connectivity environment.

The final demonstration should show not only that the AI can answer questions, but also why its answers can be trusted, where the information came from, and what happens when the evidence is incomplete or contradictory.