/**
 * Bulk document import script for the NGO Knowledge Assistant.
 *
 * Usage:
 *   node scripts/import-docs.mjs <data-dir>
 *
 * Where <data-dir> is the root of the extracted D4GC data folder,
 * containing Original/ (PDFs, HTML) and Parsed/ (Markdown) subdirectories.
 *
 * What it does:
 * 1. Walks the Parsed/ folder to find all .md files.
 * 2. For each Markdown file, tries to find a matching original (PDF or HTML)
 *    in Original/ by normalised filename.
 * 3. Extracts a title from the first heading or first line of the file.
 * 4. Computes a SHA-256 content hash for duplicate detection.
 * 5. Splits the content into chunks (~500 chars at paragraph boundaries).
 * 6. Inserts the document metadata and all chunks into Supabase.
 * 7. Detects exact duplicates (same content_hash) and groups them.
 * 8. Records quality flags for missing metadata, extraction issues, etc.
 * 9. Prints a summary at the end.
 *
 * This script is idempotent: re-running it updates existing documents
 * (matched by parsed_path) rather than creating duplicates.
 *
 * Environment variables (read from .env or process.env):
 *   SUPABASE_URL            — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key for writes
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, extname, relative, sep } from "node:path";
import { createHash } from "node:crypto";

// ── Config ──────────────────────────────────────────────────────────
const DATA_DIR = process.argv[2];
const CHUNK_SIZE = 500;

if (!DATA_DIR) {
  console.error("Usage: node scripts/import-docs.mjs <data-dir>");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// ── Helpers ─────────────────────────────────────────────────────────

function walkDir(dir, ext) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkDir(full, ext));
    } else if (extname(entry).toLowerCase() === ext) {
      results.push(full);
    }
  }
  return results;
}

function normalizeName(filepath) {
  return basename(filepath, extname(filepath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractTitle(content, filename) {
  // Try first markdown heading
  const headingMatch = content.match(/^#{1,3}\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();
  // Try first non-empty line
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length > 0) {
    const first = lines[0].trim();
    if (first.length < 200) return first;
  }
  // Fall back to filename
  return basename(filename, extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectDocType(title, content) {
  const lower = (title + " " + content.slice(0, 500)).toLowerCase();
  if (/protocol/.test(lower)) return "protocol";
  if (/guideline/.test(lower)) return "guideline";
  if (/manual|handbook/.test(lower)) return "manual";
  if (/policy/.test(lower)) return "policy";
  if (/training|curriculum/.test(lower)) return "training";
  if (/research|study|evidence/.test(lower)) return "research";
  if (/report|brief/.test(lower)) return "report";
  return "other";
}

function detectTopics(title, content) {
  const lower = (title + " " + content.slice(0, 1000)).toLowerCase();
  const topics = [];
  if (/clinical|protocol|treatment|therapy|diagnosis|diagnostic/.test(lower))
    topics.push("Clinical guidance and protocols");
  if (/disease|infection|pathogen|virus|bacteria/.test(lower))
    topics.push("Diseases, diagnosis, and treatment");
  if (/epidemiolog|surveillance|outbreak|incidence/.test(lower))
    topics.push("Epidemiology and surveillance");
  if (/vaccination|vaccine|nutrition|mental health/.test(lower))
    topics.push("Public health, vaccination, nutrition, and mental health");
  if (/emergency|response|field|operations/.test(lower))
    topics.push("Medical operations and emergency response");
  if (/logistics|supply chain|equipment|cold chain/.test(lower))
    topics.push("Logistics, supply chains, and equipment");
  if (/security|safety|field operations/.test(lower))
    topics.push("Security and field operations");
  if (/policy|procedure|governance/.test(lower))
    topics.push("Organizational policies and procedures");
  if (/training|education|curriculum/.test(lower))
    topics.push("Training and educational material");
  if (/research|report|review|evidence/.test(lower))
    topics.push("Research, reports, and evidence reviews");
  if (topics.length === 0) topics.push("Other or unclassified");
  return [...new Set(topics)];
}

function detectLanguage(content) {
  // Simple heuristic — could be enhanced with a proper detector
  if (/\b(le|la|les|de|du|et|que|pour|dans|une|des)\b/i.test(content.slice(0, 500)))
    return "fr";
  if (/\b(el|la|los|las|de|que|para|en|una|por)\b/i.test(content.slice(0, 500)))
    return "es";
  if (/\b(der|die|das|und|ist|ein|mit|auf|für)\b/i.test(content.slice(0, 500)))
    return "de";
  return "en";
}

function detectDate(content) {
  const patterns = [
    /(?:published|date|issued|updated)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /(?:published|date|issued)[:\s]*(\d{1,2}\s+\w+\s+\d{4})/i,
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m) return m[1];
  }
  return null;
}

function detectApprovalStatus(content) {
  const lower = content.slice(0, 2000).toLowerCase();
  if (/draft|not.*approved|preliminary/.test(lower)) return "draft";
  if (/supersed|replaced by|obsolete/.test(lower)) return "superseded";
  if (/archived|retired/.test(lower)) return "archived";
  if (/approved|endorsed|ratified/.test(lower)) return "approved";
  if (/unverified|unconfirmed/.test(lower)) return "unverified";
  return "unknown";
}

function chunkContent(content) {
  const paragraphs = content.split(/\n\n+/);
  const chunks = [];
  let current = "";
  for (const para of paragraphs) {
    if (current.length + para.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += (current ? "\n\n" : "") + para;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log(`\nScanning ${DATA_DIR}...`);

  const parsedDir = join(DATA_DIR, "Parsed");
  const originalDir = join(DATA_DIR, "Original");

  if (!existsSync(parsedDir)) {
    console.error(`Parsed/ folder not found at ${parsedDir}`);
    console.error("Make sure you point to the extracted D4GC data root.");
    process.exit(1);
  }

  const mdFiles = walkDir(parsedDir, ".md");
  const pdfFiles = existsSync(originalDir) ? walkDir(originalDir, ".pdf") : [];
  const htmlFiles = existsSync(originalDir) ? walkDir(originalDir, ".html") : [];

  console.log(`Found ${mdFiles.length} Markdown files in Parsed/`);
  console.log(`Found ${pdfFiles.length} PDFs in Original/`);
  console.log(`Found ${htmlFiles.length} HTML files in Original/`);

  // Build a lookup of originals by normalised name
  const originalsByName = new Map();
  for (const f of [...pdfFiles, ...htmlFiles]) {
    originalsByName.set(normalizeName(f), f);
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const hashGroups = new Map(); // hash → [document_ids]
  const stats = { withOriginal: 0, withoutOriginal: 0, duplicates: 0 };

  for (const mdPath of mdFiles) {
    try {
      const content = readFileSync(mdPath, "utf-8");
      if (!content.trim()) {
        console.warn(`  SKIP empty: ${mdPath}`);
        skipped++;
        continue;
      }

      const normName = normalizeName(mdPath);
      const originalPath = originalsByName.get(normName) || null;
      const fileType = originalPath
        ? extname(originalPath).slice(1).toLowerCase()
        : "markdown";

      const hash = sha256(content);
      const title = extractTitle(content, mdPath);
      const docType = detectDocType(title, content);
      const topics = detectTopics(title, content);
      const language = detectLanguage(content);
      const pubDate = detectDate(content);
      const approvalStatus = detectApprovalStatus(content);

      const qualityFlags = [];
      if (!pubDate) qualityFlags.push("missing_metadata");
      if (content.length < 100) qualityFlags.push("extraction_issue");

      if (originalPath) stats.withOriginal++;
      else stats.withoutOriginal++;

      // Insert document (upsert by parsed_path)
      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .upsert(
          {
            title,
            source: null,
            original_path: originalPath
              ? relative(DATA_DIR, originalPath).split(sep).join("/")
              : null,
            parsed_path: relative(DATA_DIR, mdPath).split(sep).join("/"),
            file_type: fileType,
            language,
            publication_date: pubDate || null,
            document_type: docType,
            topics,
            approval_status: approvalStatus,
            content_hash: hash,
            processing_status: "processed",
            metadata_confidence: "medium",
            quality_flags: qualityFlags.length ? qualityFlags : null,
          },
          { onConflict: "parsed_path" }
        )
        .select("id")
        .single();

      if (docErr) {
        console.error(`  ERROR doc: ${mdPath} — ${docErr.message}`);
        failed++;
        continue;
      }

      const docId = doc.id;

      // Track hash for duplicate detection
      if (!hashGroups.has(hash)) hashGroups.set(hash, []);
      hashGroups.get(hash).push(docId);

      // Delete old chunks and re-insert
      await supabase.from("document_chunks").delete().eq("document_id", docId);

      const chunks = chunkContent(content);
      const chunkRows = chunks.map((c, i) => ({
        document_id: docId,
        chunk_index: i,
        content: c,
      }));

      // Insert in batches of 50
      for (let i = 0; i < chunkRows.length; i += 50) {
        const batch = chunkRows.slice(i, i + 50);
        const { error: chunkErr } = await supabase
          .from("document_chunks")
          .insert(batch);
        if (chunkErr) {
          console.error(
            `  ERROR chunks: ${mdPath} batch ${i} — ${chunkErr.message}`
          );
        }
      }

      imported++;
      if (imported % 50 === 0) console.log(`  Imported ${imported}...`);
    } catch (err) {
      console.error(`  FAIL: ${mdPath} — ${err.message}`);
      failed++;
    }
  }

  // Mark duplicates
  for (const [hash, ids] of hashGroups) {
    if (ids.length > 1) {
      stats.duplicates += ids.length;
      const groupId = ids[0]; // use first doc id as group id
      for (const id of ids) {
        await supabase
          .from("documents")
          .update({
            duplicate_group_id: groupId,
          })
          .eq("id", id);
      }
      console.log(`  Duplicate group (${ids.length} copies): ${hash.slice(0, 12)}...`);
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`Import complete.`);
  console.log(`  Documents imported: ${imported}`);
  console.log(`  Documents skipped:  ${skipped}`);
  console.log(`  Failures:           ${failed}`);
  console.log(`  With original:      ${stats.withOriginal}`);
  console.log(`  Without original:   ${stats.withoutOriginal}`);
  console.log(`  Duplicates found:   ${stats.duplicates}`);
  console.log(`──────────────────────────────\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
