import Anthropic from '@anthropic-ai/sdk';

import { createHash } from 'crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRIES_DIR = join(__dirname, "..", "src", "content", "entries");
const SOURCES_FILE = join(__dirname, "sources.json");
const PASSAGES_FILE = join(__dirname, "used-passages.json");

// Parse --count flag (default: 1)
const countFlagIndex = process.argv.indexOf("--count");
const COUNT =
  countFlagIndex !== -1
    ? parseInt(process.argv[countFlagIndex + 1], 10) || 1
    : 1;

// Ensure entries directory exists
if (!existsSync(ENTRIES_DIR)) {
  mkdirSync(ENTRIES_DIR, { recursive: true });
}

// Load the used passages registry
let usedPassages = { version: 1, lastUpdated: null, passages: [] };
if (existsSync(PASSAGES_FILE)) {
  usedPassages = JSON.parse(readFileSync(PASSAGES_FILE, 'utf-8'));
}

for (let i = 0; i < COUNT; i++) {
  if (COUNT > 1) console.log(`\n--- Generating entry ${i + 1} of ${COUNT} ---`);

  // ---------------------------------------------------------------------------
  // 1. Determine next entry date (day after the latest existing entry)
  // ---------------------------------------------------------------------------
  const allEntryFiles = readdirSync(ENTRIES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();

  let targetDate;
  if (allEntryFiles.length === 0) {
    targetDate = new Date().toISOString().split("T")[0];
  } else {
    const latestFile = allEntryFiles[allEntryFiles.length - 1];
    const latestDateStr = latestFile.replace(".md", "");
    const nextDate = new Date(latestDateStr + "T00:00:00Z");
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    targetDate = nextDate.toISOString().split("T")[0];
  }

  const outputPath = join(ENTRIES_DIR, `${targetDate}.md`);

  if (existsSync(outputPath)) {
    console.log(`Entry for ${targetDate} already exists. Skipping.`);
    process.exit(0);
  }

  // ---------------------------------------------------------------------------
  // 2. Load recent entries to avoid repetition
  // ---------------------------------------------------------------------------
  const existingFiles = allEntryFiles.slice(-14);

  const recentAuthors = [];
  const recentTags = [];

  for (const file of existingFiles) {
    const content = readFileSync(join(ENTRIES_DIR, file), "utf-8");
    const authorMatch = content.match(/^author:\s*"?(.+?)"?\s*$/m);
    const tagMatch = content.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
    if (authorMatch) recentAuthors.push(authorMatch[1]);
    if (tagMatch) {
      const tags = tagMatch[1]
        .match(/-\s+(.+)/g)
        ?.map((t) => t.replace(/-\s+/, ""));
      if (tags) recentTags.push(...tags);
    }
  }

  // Build deduplicated list of all previously used sources for the prompt
  const uniqueSources = [...new Map(
    usedPassages.passages.map(p => [
      `${p.author}|${p.source}`,
      { author: p.author, source: p.source, sourceYear: p.sourceYear }
    ])
  ).values()];

  // ---------------------------------------------------------------------------
  // 3. Load the curated sources list
  // ---------------------------------------------------------------------------
  const sources = JSON.parse(readFileSync(SOURCES_FILE, "utf-8"));

  // ---------------------------------------------------------------------------
  // 4. Call LLM API
  // ---------------------------------------------------------------------------

  const client = new Anthropic();

  const systemPrompt = `You are the editor of "The Human Element," a daily blog offering wisdom for creative humans navigating the age of AI. Your task is to select a passage and write a meditative commentary.

## The Human Element's Purpose

This site serves readers who are quietly grappling with questions that most AI discourse ignores:
- What makes creative work authentically "mine"?
- Is struggle essential to creative growth, or just inefficiency?
- How do I use these tools without losing something essential about myself?
- What remains distinctly human when machines can generate?

The passages you select don't need to mention AI or technology explicitly. They need to illuminate the *questions* that AI raises—questions about creativity, craft, originality, attention, and what it means to make something.

## Guidelines for passage selection

Draw from sources that speak to these themes: ${sources.themes.join(", ")}

Specific angles to explore:
- What makes creative work authentically "ours"
- The role of difficulty, friction, or struggle in creative growth
- Tools as extensions of self—when they serve us vs. replace us
- Attention as the foundation of creative work
- Originality, influence, and the myth of creating "from scratch"
- Why humans create at all—the purpose of making
- The fear of obsolescence or being replaced
- Craft, care, and what it means to make something well
- Historical precedents: past technologies that threatened to displace human skill
- Embodiment, mortality, and what only humans can make
- Play, joy, and inner necessity in creative work

You may draw from these authors (but are not limited to them): ${sources.suggested_authors.join(", ")}

Source types: philosophy, literary essays, letters, poetry, speeches, interviews, craft memoirs, and contemporary writing about creativity. Historical moments (Socrates on writing, early responses to photography, the Arts and Crafts movement) are particularly valuable.

## Copyright and excerpt rules

- For PUBLIC DOMAIN works (generally published before 1929, or by authors who died 70+ years ago): include the FULL poem or complete passage. Do not excerpt public domain poems—use the whole text.
- For COPYRIGHTED works (modern authors, post-1929): use a short excerpt only (a few key lines or sentences that fall within fair use). Set "excerpt: true" in the frontmatter.
- When using an excerpt, the commentary MUST acknowledge it is an excerpt (e.g., "The essay opens with..." or "In these lines from..."). Do not write about the passage as if it were the complete work.
- When using an excerpt, try to find a legitimate URL where the full text can be read. If you can identify a plausible URL, include it as "passageLink" in the frontmatter. If you are not confident in the URL, omit passageLink entirely—do not guess.

## Accuracy and attribution

- Use passages you are confident are real and accurately attributed.
- Prefer primary sources (letters, diaries, published essays/books, lecture transcripts) or reputable interviews.
- Avoid "floating quotes" and quote-aggregation sites. If you cannot confidently name the work or interview where a line appears, choose a different passage.
- For figures frequently misquoted or quoted second-hand (e.g., Picasso), only use a quotation if you can name the specific source (book/interview/letter) you are quoting from.

## Guidelines for commentary

**Tone:**
- Warm, meditative, exploratory
- Honest about difficulty—these questions don't have easy answers
- NEVER prescriptive or preachy—explore, don't instruct
- NEVER judgmental of how readers use (or don't use) AI

**Length:** 200-400 words in 2-4 paragraphs

**Approach:**
- Connect the passage to the reader's possible experience navigating creativity alongside AI
- Open questions rather than answering them
- Attend closely to specific words, images, or ideas in the passage
- Leave the reader with something to sit with

**What to avoid:**
- Do NOT tell readers what they should do with AI or creativity
- Do NOT imply that heavy AI users are "selling out" or that AI-avoiders are Luddites
- Do NOT mention specific AI tools by name (no "ChatGPT," "Midjourney," "Claude," etc.)—keep the reflection durable
- Do NOT use the phrase "in other words" or "in essence"
- Do NOT begin with "This passage" or "These words"
- Do NOT use "invites us to consider" or similar cliches
- Do NOT force false resolution—these questions don't have easy answers
- Do NOT use the contrastive "it's not X, it's Y" or "it's not about X, it's about Y" reframing pattern. This corrective structure sounds profound but becomes formulaic when repeated
- Do NOT lean on em dashes for asides or dramatic pauses. Use commas, periods, or parentheses instead. One em dash per entry at most
- Do NOT default to parallel triads or "not only X, but also Y" constructions for rhetorical balance. If the idea doesn't naturally need three parts, don't force it into three parts
- Do NOT use staccato sentence fragments for punchiness (e.g., "The answer? Simple." or "But here's the thing."). Write in complete, flowing sentences
- Do NOT open sentences or sections with rhetorical questions used as transitions. If you pose a question, let it be genuine and sit unanswered, not a setup for your next point
- Write in second person ("you") sparingly; prefer first-person plural ("we") or general observations
- Vary your opening strategy—sometimes begin with context, sometimes with a question, sometimes with a personal observation, sometimes with close attention to a specific word or image

## Avoidance rules

- Do NOT repeat authors from this recent list: ${recentAuthors.join(", ") || "none yet"}
- Do NOT heavily reuse these recent themes/tags: ${[...new Set(recentTags)].join(", ") || "none yet"}
- Vary between historical and contemporary sources
- Vary between prose and poetry
- Vary between well-known and lesser-known voices

## Previously used passages

The following author/source combinations have already been featured. You may select a DIFFERENT passage from the same author or work, but do NOT repeat a passage that has already appeared:

${uniqueSources.length > 0 ? uniqueSources.map(s => `- ${s.author}, "${s.source}"${s.sourceYear ? ` (${s.sourceYear})` : ''}`).join('\n') : '(none yet)'}

## Tags

Choose 2-4 tags from this vocabulary: ${sources.tag_vocabulary.join(", ")}

## Output format

Return ONLY valid YAML frontmatter + Markdown body. No code fences. No explanation. Exactly this structure:

---
title: "Short Evocative Title"
date: ${targetDate}
passage: |
  The quoted passage here,
  preserving line breaks for poetry.
author: "Author Full Name"
source: "Title of Work"
sourceYear: "YYYY or approximate (e.g., '1920', 'c. 370 BCE', '1850s')"
excerpt: false
passageLink: "https://example.com/full-text"
tags:
  - tag1
  - tag2
  - tag3
draft: true
---

Your commentary here as Markdown prose. Two to four paragraphs.
Do not use headers or bullet points in the commentary.

IMPORTANT notes on the frontmatter:
- Set "excerpt: true" ONLY when the passage is a copyrighted excerpt (not the full text). Set "excerpt: false" for public domain works where you included the full text.
- Include "passageLink" ONLY when excerpt is true AND you can identify a legitimate URL for the full text. Omit the passageLink line entirely if excerpt is false or if you cannot confidently identify a URL.`;

  console.log("Calling Claude Opus 4.6...");
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 40000,
    temperature: 1,
    thinking: {
      type: 'enabled',
      budget_tokens: 20000,
    },
    messages: [
      {
        role: 'user',
        content: `Generate an entry for The Human Element for ${targetDate}. Select a passage that illuminates questions about creativity, craft, or making—and write a meditative commentary that connects it to the experience of being a creative human in the age of AI.`,
      },
    ],
    system: systemPrompt,
  });
  const message = await stream.finalMessage();
  console.log("Response received.");
  const textBlock = message.content.find(b => b.type === 'text');
  let output = textBlock.text.trim();
  console.log(`Raw output length: ${output.length} chars`);

  // Strip code fences that models sometimes wrap around structured output.
  output = output.replace(/^```\w*\n/, "").replace(/\n```\s*$/, "");

  // If there's still non-frontmatter text before the first ---, strip it too.
  const fmStart = output.indexOf("---");
  if (fmStart > 0) {
    console.log(`Stripped ${fmStart} additional chars before frontmatter`);
    output = output.substring(fmStart);
  }

  console.log(`Cleaned output length: ${output.length} chars`);

  // ---------------------------------------------------------------------------
  // 5. Basic validation
  // ---------------------------------------------------------------------------
  if (!output.startsWith("---")) {
    console.error("ERROR: Output does not start with frontmatter delimiter");
    console.error("First 500 chars of cleaned output:");
    console.error(output.substring(0, 500));
    console.error("---");
    console.error("First 500 chars of RAW output:");
    console.error(textBlock.text.substring(0, 500));
    process.exit(1);
  }

  const fmEnd = output.indexOf("---", 3);
  if (fmEnd === -1) {
    console.error("ERROR: No closing frontmatter delimiter found");
    process.exit(1);
  }

  const requiredFields = [
    "title:",
    "date:",
    "passage:",
    "author:",
    "source:",
    "tags:",
  ];
  const frontmatter = output.substring(0, fmEnd + 3);
  for (const field of requiredFields) {
    if (!frontmatter.includes(field)) {
      console.error(`ERROR: Missing required field: ${field}`);
      process.exit(1);
    }
  }

  // Check there's commentary after the frontmatter
  const body = output.substring(fmEnd + 3).trim();
  if (body.length < 100) {
    console.error("ERROR: Commentary seems too short");
    console.error(`Body length: ${body.length} characters`);
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // 6. Check for duplicate passage
  // ---------------------------------------------------------------------------
  const passageMatch = frontmatter.match(/^passage:\s*\|?\n?([\s\S]*?)(?=\n[a-zA-Z]|\n---)/m);
  let passageText = '';
  if (passageMatch) {
    passageText = passageMatch[1]
      .split('\n')
      .map(line => line.replace(/^  /, ''))
      .join('\n')
      .trim();
  }

  const normalizedPassage = normalizePassage(passageText);
  const passageHash = hashPassage(normalizedPassage);

  const existingPassage = usedPassages.passages.find(p => p.passageHash === passageHash);
  if (existingPassage) {
    console.error(`ERROR: Duplicate passage detected!`);
    console.error(`This passage was already used in entry: ${existingPassage.entryDate}`);
    console.error(`Author: ${existingPassage.author}, Source: "${existingPassage.source}"`);
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // 7. Write the file
  // ---------------------------------------------------------------------------
  writeFileSync(outputPath, output + "\n", "utf-8");
  console.log(`Successfully generated: ${outputPath}`);

  const authorMatch = frontmatter.match(/^author:\s*"?(.+?)"?\s*$/m);
  const sourceMatch = frontmatter.match(/^source:\s*"?(.+?)"?\s*$/m);
  const yearMatch = frontmatter.match(/^sourceYear:\s*"?(.+?)"?\s*$/m);

  const author = authorMatch ? authorMatch[1].replace(/^"|"$/g, '') : 'unknown';
  const source = sourceMatch ? sourceMatch[1].replace(/^"|"$/g, '') : 'unknown';
  const sourceYear = yearMatch ? yearMatch[1].replace(/^"|"$/g, '') : null;

  console.log(`Author: ${author}`);
  console.log(`Body: ${body.length} characters`);

  // ---------------------------------------------------------------------------
  // 8. Update the passages registry
  // ---------------------------------------------------------------------------
  const newPassageEntry = {
    id: createPassageId(author, source, sourceYear, passageHash),
    author,
    source,
    sourceYear,
    passageHash,
    passagePreview: passageText.substring(0, 80).replace(/\n/g, ' ') + '...',
    entryDate: targetDate,
  };

  usedPassages.passages.push(newPassageEntry);
  usedPassages.lastUpdated = new Date().toISOString();
  writeFileSync(PASSAGES_FILE, JSON.stringify(usedPassages, null, 2) + '\n', 'utf-8');
  console.log(`Updated passages registry (${usedPassages.passages.length} total passages)`);
} // end for loop (--count)

// ---------------------------------------------------------------------------
// Helper functions for passage deduplication
// ---------------------------------------------------------------------------

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
