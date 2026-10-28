export type ApprovalStatus =
  | "approved"
  | "draft"
  | "superseded"
  | "archived"
  | "unverified"
  | "unknown";

export type DocType =
  | "guideline"
  | "protocol"
  | "research"
  | "manual"
  | "policy"
  | "training"
  | "report"
  | "other";

export interface DocumentRow {
  id: string;
  title: string;
  source: string | null;
  original_path: string | null;
  parsed_path: string | null;
  file_type: string;
  language: string | null;
  publication_date: string | null;
  last_updated_date: string | null;
  document_type: DocType | null;
  topics: string[] | null;
  geographic_scope: string | null;
  approval_status: ApprovalStatus;
  version: string | null;
  content_hash: string | null;
  duplicate_group_id: string | null;
  processing_status: string;
  metadata_confidence: string | null;
  quality_flags: string[] | null;
  created_at: string;
}

export interface ChunkRow {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  section: string | null;
  page: number | null;
}

export interface SearchHit {
  document: DocumentRow;
  chunk: ChunkRow;
  snippet: string;
  rank: number;
}

export interface QAResult {
  answer: string;
  citations: {
    document_id: string;
    title: string;
    source: string | null;
    snippet: string;
    section: string | null;
    page: number | null;
    approval_status: ApprovalStatus;
  }[];
  conflicts: string[];
  insufficient: boolean;
}
