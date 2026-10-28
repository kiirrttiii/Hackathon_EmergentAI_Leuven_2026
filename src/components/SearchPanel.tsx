import { useState } from "react";
import { searchDocuments, fetchTopics } from "../lib/search";
import { fetchAllDocuments } from "../lib/search";
import type { SearchHit, DocType } from "../types";
import { StatusBadge, docTypes } from "./StatusBadge";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [docType, setDocType] = useState<DocType | "all">("all");
  const [topic, setTopic] = useState("all");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  async function loadTopics() {
    if (topics.length > 0) return;
    try {
      const t = await fetchTopics();
      setTopics(t);
    } catch {
      // ignore
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const hits = await searchDocuments(query, {
        docType,
        topic: topic === "all" ? "" : topic,
      });
      setResults(hits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBrowseAll() {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const docs = await fetchAllDocuments({
        docType,
        topic: topic === "all" ? "" : topic,
      });
      setResults(
        docs.map((d: any) => ({
          document: d,
          chunk: {
            id: "",
            document_id: d.id,
            chunk_index: 0,
            content: "",
            section: null,
            page: null,
          },
          snippet: "",
          rank: 0,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Search documents by keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              loadTopics();
            }}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="input max-w-[180px]"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType | "all")}
            onFocus={loadTopics}
          >
            {docTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            className="input max-w-[180px]"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={loadTopics}
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="button" className="btn-ghost" onClick={handleBrowseAll}>
            Browse all
          </button>
        </div>
      </form>

      {error && (
        <div className="card border-error-500 text-error-700 text-sm">
          {error}
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="card text-center text-neutral-500 text-sm py-8">
          No documents found. Try different keywords or broaden your filters.
        </div>
      )}

      <div className="space-y-3">
        {results.map((hit, i) => (
          <ResultCard key={`${hit.document.id}-${i}`} hit={hit} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ hit }: { hit: SearchHit }) {
  const doc = hit.document;
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug">
          {doc.title}
        </h3>
        <StatusBadge status={doc.approval_status} />
      </div>
      <div className="text-xs text-neutral-500 mb-2 flex flex-wrap gap-x-3 gap-y-1">
        {doc.source && <span>Source: {doc.source}</span>}
        {doc.file_type && <span>Type: {doc.file_type.toUpperCase()}</span>}
        {doc.document_type && <span>Category: {doc.document_type}</span>}
        {doc.publication_date && <span>Date: {doc.publication_date}</span>}
        {doc.original_path && (
          <span className="font-mono">{doc.original_path}</span>
        )}
      </div>
      {hit.snippet && (
        <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
          {hit.snippet}
        </p>
      )}
      {doc.topics && doc.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {doc.topics.map((t) => (
            <span
              key={t}
              className="badge bg-primary-50 text-primary-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
