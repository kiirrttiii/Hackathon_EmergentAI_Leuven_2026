import { supabase } from "./supabase";
import type { QAResult } from "../types";

export async function askQuestion(question: string): Promise<QAResult> {
  if (!question.trim()) {
    return { answer: "", citations: [], conflicts: [], insufficient: true };
  }

  const { data: chunks, error } = await supabase
    .from("document_chunks")
    .select(
      `id, document_id, chunk_index, content, section, page,
       documents (id, title, source, approval_status)`
    )
    .textSearch("content", question, { type: "websearch" })
    .limit(15);

  if (error) throw error;
  if (!chunks || chunks.length === 0) {
    return {
      answer: "No relevant information was found in the indexed document collection.",
      citations: [],
      conflicts: [],
      insufficient: true,
    };
  }

  const ranked = rankByRelevance(chunks, question);
  const top = ranked.slice(0, 5);
  const citations = top.map((c: any) => ({
    document_id: c.documents.id,
    title: c.documents.title,
    source: c.documents.source || null,
    snippet: c.content.slice(0, 280) + (c.content.length > 280 ? "…" : ""),
    section: c.section,
    page: c.page,
    approval_status: c.documents.approval_status,
  }));

  const conflicts = detectConflicts(top);

  const answer = composeAnswer(question, top, conflicts);

  return {
    answer,
    citations,
    conflicts,
    insufficient: top.length === 0,
  };
}

function rankByRelevance(chunks: any[], question: string): any[] {
  const terms = question.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  return [...chunks].sort((a, b) => {
    const aScore = terms.reduce(
      (s, t) => s + (a.content.toLowerCase().includes(t) ? 1 : 0),
      0
    );
    const bScore = terms.reduce(
      (s, t) => s + (b.content.toLowerCase().includes(t) ? 1 : 0),
      0
    );
    return bScore - aScore;
  });
}

function detectConflicts(chunks: any[]): string[] {
  const statusByDoc = new Map<string, string>();
  chunks.forEach((c: any) => {
    const docId = c.documents.id;
    const status = c.documents.approval_status;
    if (statusByDoc.has(docId) && statusByDoc.get(docId) !== status) {
      // same doc, different status — shouldn't happen, skip
    }
    statusByDoc.set(docId, status);
  });

  const statuses = new Set(statusByDoc.values());
  const conflicts: string[] = [];

  if (statuses.has("approved") && statuses.has("draft")) {
    conflicts.push(
      "Some retrieved passages come from draft documents while others come from approved documents. Treat draft content with caution."
    );
  }
  if (statuses.has("approved") && statuses.has("superseded")) {
    conflicts.push(
      "Some retrieved passages come from superseded documents. The superseded content may conflict with the approved version."
    );
  }
  if (statuses.has("approved") && statuses.has("archived")) {
    conflicts.push(
      "Some retrieved passages come from archived documents. Verify whether the archived information is still current."
    );
  }

  return conflicts;
}

function composeAnswer(_question: string, chunks: any[], _conflicts: string[]): string {
  if (chunks.length === 0) {
    return "The available documents do not contain enough information to answer this question.";
  }

  const topChunk = chunks[0];
  const statuses = new Set(chunks.map((c) => c.documents.approval_status));
  const allApproved = statuses.size === 1 && statuses.has("approved");

  let answer = "Based on the retrieved documents, the most relevant information is:\n\n";
  answer += `"${topChunk.content.slice(0, 400)}${topChunk.content.length > 400 ? "…" : ""}"\n\n`;
  answer += `This passage was found in ${chunks.length} retrieved passage${chunks.length > 1 ? "s" : ""} from the document collection.`;

  if (allApproved) {
    answer += " All cited sources have approved status.";
  } else if (statuses.has("approved")) {
    answer += " Some sources have approved status; others are drafts or unverified — review before relying on them.";
  } else {
    answer += " None of the cited sources have confirmed approved status. Treat this information as unverified.";
  }

  return answer;
}
