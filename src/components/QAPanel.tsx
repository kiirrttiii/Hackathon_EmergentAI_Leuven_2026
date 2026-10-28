import { useState } from "react";
import { askQuestion } from "../lib/qa";
import type { QAResult } from "../types";
import { StatusBadge } from "./StatusBadge";

export function QAPanel() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await askQuestion(question);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retrieve answer.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAsk}>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask a question about the documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Searching…" : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <div className="card border-error-500 text-error-700 text-sm">
          {error}
        </div>
      )}

      {result && !error && (
        <div className="space-y-3">
          {result.insufficient && (
            <div className="card border-l-4 border-l-warning-500 bg-warning-50 text-warning-700 text-sm">
              <strong>Insufficient evidence:</strong> The indexed documents do
              not contain enough information to confidently answer this question.
            </div>
          )}

          {result.conflicts.length > 0 && (
            <div className="card border-l-4 border-l-error-500 bg-error-50 text-error-700 text-sm space-y-1">
              {result.conflicts.map((c, i) => (
                <p key={i}>
                  <strong>Conflict:</strong> {c}
                </p>
              ))}
            </div>
          )}

          {result.answer && (
            <div className="card">
              <h3 className="text-sm font-semibold text-neutral-500 mb-2">
                Answer
              </h3>
              <p className="text-sm text-neutral-800 whitespace-pre-line leading-relaxed">
                {result.answer}
              </p>
            </div>
          )}

          {result.citations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 mb-2">
                Source citations ({result.citations.length})
              </h3>
              <div className="space-y-2">
                {result.citations.map((c, i) => (
                  <div key={i} className="card">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-primary-600">
                          [{i + 1}]
                        </span>
                        <span className="font-medium text-sm text-neutral-900">
                          {c.title}
                        </span>
                      </div>
                      <StatusBadge status={c.approval_status} />
                    </div>
                    <div className="text-xs text-neutral-500 mb-1.5">
                      {c.source && <span>Source: {c.source} · </span>}
                      {c.section && <span>Section: {c.section} · </span>}
                      {c.page && <span>Page: {c.page} · </span>}
                      Document ID: {c.document_id.slice(0, 8)}
                    </div>
                    <p className="text-sm text-neutral-700 bg-neutral-50 rounded p-2 border border-neutral-100 leading-relaxed">
                      "{c.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
