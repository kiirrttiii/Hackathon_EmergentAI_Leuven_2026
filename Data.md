# DATA.md — Data and Information Context

## 1. Available Context

The NGO is an international independent medical humanitarian organization with tens of thousands of professionals working across diverse and often resource-constrained environments.

Its staff generate and consume large volumes of documents, including medical protocols, operational manuals, scientific publications, presentations, and datasets.

The organization faces challenges related to document lifecycle management, fragmented information, conflicting versions, unreliable connectivity, confidentiality, and varied levels of digital literacy.

The information supplied for the hackathon describes the organization's context and scale. It does not constitute an actual document repository or a validated dataset for the prototype.

## 2. Expected Document Types

The prototype may eventually work with:

- Medical protocols and clinical guidance
- Operational and logistical manuals
- Epidemiological reports and research publications
- Training and onboarding materials
- Presentations and internal reports
- Structured operational datasets

Actual file formats, data sources, and access permissions must be confirmed with the challenge organizers.

## 3. Proposed Document Metadata

Where available and authorized, store:

- Document identifier
- Title
- Document type and topic
- Source and responsible department
- Author or document owner
- Creation and last-modified dates
- Version identifier
- Approval status
- Effective date and review date
- Language
- Confidentiality classification
- Access permissions
- Extracted text and source-location references
- Superseded-document relationship, if applicable

Missing metadata must remain explicitly unknown rather than being invented.

## 4. Source Reliability and Document Status

Do not assume that the newest, most frequently accessed, or most relevant-looking document is automatically authoritative.

Where the organization supplies the necessary information, distinguish between:

- Approved and currently effective documents
- Drafts awaiting review
- Superseded documents
- Archived documents
- Unverified or externally sourced material

Authority should follow the NGO's approved governance rules, designated document owners, and applicable policies.

When sources conflict, show the relevant documents, their available metadata, and the disagreement. Do not silently choose a source without a defensible rule.

## 5. Search and AI Answering

For AI-assisted retrieval:

1. Search only documents the user is authorized to access.
2. Retrieve relevant passages from those documents.
3. Generate answers based on the retrieved evidence.
4. Provide traceable citations to the source document and page or section where possible.
5. Indicate when the evidence is incomplete, outdated, or contradictory.
6. Abstain from making unsupported claims.

A citation must point to real source content, not merely a document with a similar title.

## 6. Confidentiality and Data Handling

- Use synthetic or anonymized documents for hackathon testing.
- Do not upload patient-identifiable information or confidential operational information to public repositories.
- Do not send sensitive information to unapproved AI providers.
- Apply authorization before retrieving or displaying restricted content.
- Define retention, deletion, backup, and synchronization policies before production deployment.

## 7. Offline Data Requirements

Essential documents and their search indexes should be available locally when authorized and technically feasible.

Synchronization should preserve version history and detect conflicting updates. Restricted information must not automatically propagate to every device.

The prototype should clearly indicate when local content may be stale or when newer versions cannot be checked because the device is offline.

## 8. Test Data

Use a small, synthetic collection that includes:

- Two versions of the same protocol
- An approved document and an unapproved draft
- An outdated document marked as superseded
- Two documents containing conflicting guidance
- A document with missing metadata
- A document containing the answer to a test question
- A question whose answer is not present in the collection
- Documents assigned different access permissions

These scenarios will help evaluate search relevance, version awareness, citation accuracy, uncertainty handling, and access control.

## 9. Open Questions

Confirm with the NGO:

- Which repositories and file formats are currently used?
- Who owns and approves each document type?
- How are effective versions identified?
- Which languages must be supported?
- What confidentiality classifications apply?
- What local storage and retention policies are required?
- How large are the document collections?
- Which devices and offline durations must be supported?

Until these questions are answered, all proposed metadata, search behavior, and data-handling assumptions should be treated as provisional.