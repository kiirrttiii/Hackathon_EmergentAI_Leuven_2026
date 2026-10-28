import { supabase } from "./supabase";
import type { SearchHit, DocType } from "../types";

export async function searchDocuments(
  query: string,
  filters: { docType?: DocType | "all"; topic?: string }
): Promise<SearchHit[]> {
  if (!query.trim()) return [];

  const { data: chunks, error } = await supabase
    .from("document_chunks")
    .select(
      `id, document_id, chunk_index, content, section, page,
       documents (
         id, title, source, original_path, parsed_path, file_type,
         language, publication_date, last_updated_date, document_type,
         topics, geographic_scope, approval_status, version,
         content_hash, duplicate_group_id, processing_status,
         metadata_confidence, quality_flags, created_at
       )`
    )
    .textSearch("content", query, { type: "websearch" })
    .limit(30);

  if (error) throw error;
  if (!chunks) return [];

  const hits: SearchHit[] = chunks
    .filter((c: any) => c.documents)
    .map((c: any, i: number) => {
      const snippet = makeSnippet(c.content, query);
      return {
        document: c.documents,
        chunk: {
          id: c.id,
          document_id: c.document_id,
          chunk_index: c.chunk_index,
          content: c.content,
          section: c.section,
          page: c.page,
        },
        snippet,
        rank: i,
      };
    });

  return applyFilters(hits, filters);
}

export async function fetchAllDocuments(filters: {
  docType?: DocType | "all";
  topic?: string;
}) {
  let q = supabase.from("documents").select("*").order("title");

  if (filters.docType && filters.docType !== "all") {
    q = q.eq("document_type", filters.docType);
  }
  const { data, error } = await q;
  if (error) throw error;

  let docs = data || [];
  if (filters.topic) {
    docs = docs.filter((d: any) => d.topics?.includes(filters.topic as string));
  }
  return docs;
}

export async function fetchTopics(): Promise<string[]> {
  const { data, error } = await supabase.from("documents").select("topics");
  if (error) throw error;
  if (!data) return [];
  const set = new Set<string>();
  data.forEach((d: any) => {
    if (Array.isArray(d.topics)) d.topics.forEach((t: string) => set.add(t));
  });
  return Array.from(set).sort();
}

function applyFilters(hits: SearchHit[], filters: { docType?: DocType | "all"; topic?: string }): SearchHit[] {
  let result = hits;
  if (filters.docType && filters.docType !== "all") {
    result = result.filter((h) => h.document.document_type === filters.docType);
  }
  const topic = filters.topic;
  if (topic) {
    result = result.filter((h) => h.document.topics?.includes(topic));
  }
  return result;
}

function makeSnippet(content: string, query: string, maxLen = 200): string {
  if (!content) return "";
  const lower = content.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  let bestPos = 0;
  let bestScore = 0;
  const window = 120;
  for (let i = 0; i <= content.length - window; i += 20) {
    const slice = lower.slice(i, i + window);
    const score = terms.reduce((s, t) => s + (slice.includes(t) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestPos = i;
    }
  }
  let snippet = content.slice(bestPos, bestPos + maxLen).trim();
  if (bestPos > 0) snippet = "…" + snippet;
  if (bestPos + maxLen < content.length) snippet += "…";
  return snippet;
}
