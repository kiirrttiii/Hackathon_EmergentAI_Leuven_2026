/*
# Create documents and document_chunks tables

## 1. Purpose
This migration creates the core tables for the NGO Knowledge Assistant:
a document catalogue and a searchable text-chunks table that powers
keyword search and passage-level question answering with citations.

## 2. New Tables

### documents
One row per identifiable document in the collection. Stores metadata
defined in DATA.md §4:
- id (uuid PK)
- title (text, not null)
- source (text, nullable) — publisher or issuing organization
- original_path (text, nullable) — path to the original file (PDF/HTML)
- parsed_path (text, nullable) — path to the parsed Markdown version
- file_type (text) — pdf, html, or markdown
- language (text, nullable) — detected language
- publication_date (date, nullable)
- last_updated_date (date, nullable)
- document_type (text, nullable) — guideline, protocol, research, manual, policy, training, report, other
- topics (text[], nullable) — one or more taxonomy categories
- geographic_scope (text, nullable)
- approval_status (text, default 'unknown') — approved, draft, superseded, archived, unverified, unknown
- version (text, nullable)
- content_hash (text, nullable) — for duplicate detection
- duplicate_group_id (uuid, nullable) — groups potential duplicates
- processing_status (text, default 'pending') — pending, processed, partially_processed, failed
- metadata_confidence (text, nullable) — high, medium, low
- quality_flags (text[], nullable) — missing_metadata, possible_outdated, extraction_issue, possible_conflict, etc.
- created_at (timestamptz, default now())

### document_chunks
One row per passage/section extracted from a document. Powers full-text
search and passage-level retrieval with citations:
- id (uuid PK)
- document_id (uuid FK → documents.id, on delete cascade)
- chunk_index (int) — ordering within the document
- content (text, not null) — the passage text
- section (text, nullable) — section heading if available
- page (int, nullable) — page number if available
- fts (tsvector, generated from content) — for full-text search

## 3. Indexes
- documents.file_type for filter queries
- documents.document_type for filter queries
- document_chunks.document_id for join performance
- GIN index on documents.topics for array-containment filters
- GIN index on document_chunks.fts for full-text search

## 4. Security
- RLS enabled on both tables.
- Single-tenant prototype with no sign-in: grants to anon + authenticated.
- All CRUD policies use USING (true) / WITH CHECK (true) because the
  data is intentionally shared across the prototype (no per-user isolation).
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text,
  original_path text,
  parsed_path text,
  file_type text NOT NULL DEFAULT 'markdown',
  language text,
  publication_date date,
  last_updated_date date,
  document_type text,
  topics text[],
  geographic_scope text,
  approval_status text NOT NULL DEFAULT 'unknown',
  version text,
  content_hash text,
  duplicate_group_id uuid,
  processing_status text NOT NULL DEFAULT 'pending',
  metadata_confidence text,
  quality_flags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);

-- Chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL DEFAULT 0,
  content text NOT NULL,
  section text,
  page int,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON document_chunks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_chunks" ON document_chunks;
CREATE POLICY "anon_select_chunks" ON document_chunks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chunks" ON document_chunks;
CREATE POLICY "anon_insert_chunks" ON document_chunks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chunks" ON document_chunks;
CREATE POLICY "anon_update_chunks" ON document_chunks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chunks" ON document_chunks;
CREATE POLICY "anon_delete_chunks" ON document_chunks FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_fts ON document_chunks USING gin (fts);
CREATE INDEX IF NOT EXISTS idx_documents_topics ON documents USING gin (topics);
