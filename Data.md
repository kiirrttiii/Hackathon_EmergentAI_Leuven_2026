# DATA.md — D4GC Humanitarian Knowledge Dataset

## 1. Purpose

This file defines how the D4GC hackathon project should discover, organize, index, search, and evaluate the document collection supplied for the challenge.

The objective is to identify useful information, improve the structure and discoverability of the existing documents, and build a source-grounded information retrieval system suitable for humanitarian and medical operations.

## 2. Dataset overview

The supplied archive is named `D4GC data.zip`.

The initial archive inventory indicates that it contains:
- An `Original/` folder containing HTML and PDF documents.
- A `Parsed/` folder containing Markdown versions of documents.

The initial reported inventory is approximately 1,164 files in total, comprising 342 HTML files, 240 PDFs, and 582 Markdown files. These counts and the reported uncompressed size of approximately 404 MB must be verified against the extracted dataset before being treated as final.

The Markdown documents are likely intended to make extracted content easier to process. They must not automatically be treated as complete or perfectly accurate representations of their originals.

## 3. Data access and preservation

- Treat the supplied collection as the primary input dataset for the prototype.
- Use the complete dataset when it is accessible and authorized for the intended processing.
- Preserve the original files unchanged.
- Keep the original and parsed versions linked wherever a reliable match can be established.
- Record inaccessible, unreadable, corrupt, or unsuccessfully parsed files.
- Do not silently omit files that fail processing.
- Do not delete or overwrite duplicates. Identify duplicate candidates and recommend review or deduplication for the search index.
- Keep the dataset separate from application source code where practical.
- Do not commit the complete dataset to a public repository unless the organizers explicitly permit that form of redistribution.
- Do not transmit documents to external AI services unless that processing is permitted by the challenge rules.

## 4. Document catalogue and metadata

Create a catalogue with one record per identifiable document. Suggested fields include:

- `document_id`: stable unique identifier.
- `original_path`: path to the original file, if available.
- `parsed_path`: path to its parsed Markdown version, if available.
- `title`: document title.
- `source`: publisher, issuing organization, or source location, where available.
- `file_type`: PDF, HTML, or Markdown.
- `language`: detected language, with confidence where feasible.
- `publication_date`: publication date, if available.
- `last_updated_date`: update date, if available.
- `document_type`: guideline, protocol, research, manual, policy, training material, or other supported type.
- `topics`: one or more categories from a documented taxonomy.
- `geographic_scope`: applicable location or region, if available.
- `approval_status`: approved, draft, superseded, archived, unverified, or unknown, only where supported by evidence.
- `version`: document version, where available.
- `content_hash`: hash for identifying exact duplicate files.
- `duplicate_group_id`: identifier for a potential duplicate group.
- `processing_status`: pending, processed, partially processed, or failed.
- `metadata_confidence`: confidence or provenance of inferred metadata.
- `quality_flags`: missing metadata, possible outdated content, extraction issue, possible conflict, or other review flags.

Do not invent missing values. Distinguish extracted metadata from inferred metadata and record uncertainty.

## 5. Initial taxonomy

Evaluate and refine a configurable taxonomy that may include:

- Clinical guidance and protocols.
- Diseases, diagnosis, and treatment.
- Epidemiology and surveillance.
- Public health, vaccination, nutrition, and mental health.
- Medical operations and emergency response.
- Logistics, supply chains, and equipment.
- Security and field operations.
- Organizational policies and procedures.
- Training and educational material.
- Research, reports, and evidence reviews.
- Other or unclassified.

A document may belong to multiple topics. Preserve an unclassified option when evidence is insufficient.

## 6. Document quality and lifecycle

The system should help users identify:

- Exact and near-duplicate documents.
- Documents with missing titles, dates, sources, or versions.
- Documents with incomplete or failed text extraction.
- Potentially outdated material.
- Conflicting recommendations across sources.
- Draft, archived, superseded, or unverified documents.
- Documents whose authority or current status cannot be established.

A publication date alone does not establish whether a document is authoritative or currently valid. The system must not independently declare clinical guidance approved or safe.

Quality flags should explain the reason for review and, where possible, point to the evidence. Human review should be available for uncertain classifications and conflicts.

## 7. Information retrieval requirements

The retrieval system should:

- Index all successfully processed documents in the authorized collection.
- Support keyword search as a reliable baseline.
- Support filters based on available metadata.
- Retrieve relevant passages rather than relying only on whole-document summaries.
- Show document titles, sources, dates, relevant excerpts, and document status where verified.
- Provide links or navigation to the original document and relevant parsed content.
- Cite the source passages used for generated answers.
- Identify uncertainty and conflicting evidence.
- Say when sufficient supporting information cannot be found.
- Avoid generating unsupported medical recommendations.
- Continue to provide basic search when an optional AI service is unavailable.

## 8. Offline and low-resource requirements

Prioritize local indexing and search where feasible, low resource consumption, clear status indicators, and simple navigation.

Document which features require connectivity. Do not claim that AI question answering, synchronization, or the entire application works offline until tested in the actual deployment environment.

## 9. Testing and evaluation

Evaluate the system using representative documents and, where feasible, the full collection.

Include tests for:
- Coverage of the supplied files.
- Correct matching of parsed and original documents.
- Search relevance and retrieval of the correct source.
- Citation correctness.
- Duplicate detection.
- Missing and incorrectly inferred metadata.
- Conflicting or potentially outdated material.
- Unsupported questions and insufficient evidence.
- Failed extraction and unreadable documents.
- Operation when connectivity or an external AI service is unavailable.
- Access restrictions and protection of confidential content.

Report actual results, limitations, and known failures rather than claiming untested capabilities.

## 10. Open questions

The implementation should establish:
- The verified file count and extracted directory structure.
- Whether every parsed Markdown file has a matching original.
- Whether the collection includes explicit source, date, version, or approval metadata.
- Which formats and languages are represented.
- Which retrieval and AI capabilities are feasible in the chosen runtime.
- Which dataset handling and redistribution rules apply to the challenge.
- How offline operation can be demonstrated and tested.

Resolve these questions through inspection and testing, not assumptions.