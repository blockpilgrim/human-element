/**
 * One-time script to backfill the used-passages.json registry
 * from all existing entries in src/content/entries/
 *
 * Run with: node scripts/backfill-passages.mjs
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRIES_DIR = join(__dirname, '..', 'src', 'content', 'entries');
const PASSAGES_FILE = join(__dirname, 'used-passages.json');

/**
 * Normalize passage text for consistent hashing:
 * - Lowercase
 * - Collapse whitespace (including newlines) to single spaces
 * - Strip punctuation
 * - Trim
 */
function normalizePassage(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Generate SHA-256 hash of normalized passage text
 */
function hashPassage(normalizedText) {
  return createHash('sha256').update(normalizedText).digest('hex');
}

/**
 * Create a human-readable ID from author, source, year, and hash
 */
function createPassageId(author, source, year, hash) {
  const slug = [author, source, year]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${slug}-${hash.substring(0, 8)}`;
}

/**
 * Extract frontmatter fields from markdown content
 */
function extractFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1];

  // Extract author
  const authorMatch = fm.match(/^author:\s*"?(.+?)"?\s*$/m);
  const author = authorMatch ? authorMatch[1].replace(/^"|"$/g, '') : null;

  // Extract source
  const sourceMatch = fm.match(/^source:\s*"?(.+?)"?\s*$/m);
  const source = sourceMatch ? sourceMatch[1].replace(/^"|"$/g, '') : null;

  // Extract sourceYear
  const yearMatch = fm.match(/^sourceYear:\s*"?(.+?)"?\s*$/m);
  const sourceYear = yearMatch ? yearMatch[1].replace(/^"|"$/g, '') : null;

  // Extract passage (handles multi-line YAML block scalar)
  const passageMatch = fm.match(/^passage:\s*\|?\n?([\s\S]*?)(?=\n[a-zA-Z]|\n---)/m);
  let passage = null;
  if (passageMatch) {
    // Handle YAML block scalar (indented lines)
    passage = passageMatch[1]
      .split('\n')
      .map(line => line.replace(/^  /, '')) // Remove 2-space indent
      .join('\n')
      .trim();
  }

  return { author, source, sourceYear, passage };
}

// Main execution
console.log('Backfilling used-passages.json from existing entries...\n');

const entryFiles = readdirSync(ENTRIES_DIR)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort();

console.log(`Found ${entryFiles.length} entries to process.\n`);

const passages = [];
const seenHashes = new Set();

for (const file of entryFiles) {
  const entryDate = file.replace('.md', '');
  const content = readFileSync(join(ENTRIES_DIR, file), 'utf-8');
  const fm = extractFrontmatter(content);

  if (!fm || !fm.passage) {
    console.log(`⚠️  ${file}: Could not extract passage`);
    continue;
  }

  const normalized = normalizePassage(fm.passage);
  const hash = hashPassage(normalized);

  if (seenHashes.has(hash)) {
    console.log(`⚠️  ${file}: DUPLICATE HASH detected (${hash.substring(0, 8)})`);
  }
  seenHashes.add(hash);

  const passageEntry = {
    id: createPassageId(fm.author, fm.source, fm.sourceYear, hash),
    author: fm.author,
    source: fm.source,
    sourceYear: fm.sourceYear || null,
    passageHash: hash,
    passagePreview: fm.passage.substring(0, 80).replace(/\n/g, ' ') + '...',
    entryDate,
  };

  passages.push(passageEntry);
  console.log(`✓ ${file}: ${fm.author} — "${fm.source}"`);
}

const registry = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  passages,
};

writeFileSync(PASSAGES_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf-8');

console.log(`\n✅ Wrote ${passages.length} entries to ${PASSAGES_FILE}`);
console.log(`   Unique hashes: ${seenHashes.size}`);
