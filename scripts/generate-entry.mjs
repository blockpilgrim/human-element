import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRIES_DIR = join(__dirname, '..', 'src', 'content', 'entries');
const SOURCES_FILE = join(__dirname, 'sources.json');

// ---------------------------------------------------------------------------
// 1. Determine today's date and check if entry already exists
// ---------------------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];
const outputPath = join(ENTRIES_DIR, `${today}.md`);

if (existsSync(outputPath)) {
  console.log(`Entry for ${today} already exists. Skipping.`);
  process.exit(0);
}

// Ensure entries directory exists
if (!existsSync(ENTRIES_DIR)) {
  mkdirSync(ENTRIES_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 2. Load recent entries to avoid repetition
// ---------------------------------------------------------------------------
const existingFiles = readdirSync(ENTRIES_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .slice(-14);

const recentAuthors = [];
const recentTags = [];

for (const file of existingFiles) {
  const content = readFileSync(join(ENTRIES_DIR, file), 'utf-8');
  const authorMatch = content.match(/^author:\s*"?(.+?)"?\s*$/m);
  const tagMatch = content.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (authorMatch) recentAuthors.push(authorMatch[1]);
  if (tagMatch) {
    const tags = tagMatch[1].match(/-\s+(.+)/g)?.map((t) => t.replace(/-\s+/, ''));
    if (tags) recentTags.push(...tags);
  }
}

// ---------------------------------------------------------------------------
// 3. Load the curated sources list
// ---------------------------------------------------------------------------
const sources = JSON.parse(readFileSync(SOURCES_FILE, 'utf-8'));

// ---------------------------------------------------------------------------
// 4. Call Claude API
// ---------------------------------------------------------------------------
const client = new Anthropic();

const systemPrompt = `You are the editor of "The Daily Sublime," a daily secular devotional blog. Your task is to select a passage and write a brief commentary.

## Guidelines for passage selection:
- Draw from: philosophy, literature, poetry, religious texts (treated as literature), speeches, essays, letters, and song lyrics
- Span cultures, centuries, and traditions: ${sources.traditions.join(', ')}
- Passages should be 1-8 lines of poetry, or 1-5 sentences of prose
- They should carry emotional or intellectual weight suitable for quiet morning reflection
- They should be accessible to a general reader without specialized knowledge
- You may draw from these authors (but are not limited to them): ${sources.suggested_authors.join(', ')}

## Guidelines for commentary:
- 200-400 words in 2-4 paragraphs
- Warm, thoughtful, accessible tone — like a well-read friend reflecting over morning coffee
- Do NOT preach, instruct, or moralize
- Connect the passage to lived experience
- Offer a gentle reframing or unexpected angle
- Leave the reader with something to sit with
- Do NOT use the phrase "in other words" or "in essence"
- Do NOT begin with "This passage" or "These words"
- Do NOT use "invites us to consider" or similar cliches
- Write in second person ("you") sparingly; prefer first-person plural ("we") or general observations
- Vary your opening strategy — sometimes begin with context, sometimes with a question, sometimes with a personal observation, sometimes with close attention to a specific word or image

## Avoidance rules:
- Do NOT repeat authors from this recent list: ${recentAuthors.join(', ') || 'none yet'}
- Do NOT heavily reuse these recent themes/tags: ${[...new Set(recentTags)].join(', ') || 'none yet'}
- Vary between Eastern and Western sources
- Vary between ancient and modern sources
- Vary between prose and poetry

## Tags:
Choose 2-4 tags from this vocabulary: ${sources.tag_vocabulary.join(', ')}

## Output format:
Return ONLY valid YAML frontmatter + Markdown body. No code fences. No explanation. Exactly this structure:

---
title: "Short Evocative Title"
date: ${today}
passage: |
  The quoted passage here,
  preserving line breaks for poetry.
author: "Author Full Name"
source: "Title of Work"
sourceYear: YYYY
tags:
  - tag1
  - tag2
  - tag3
draft: false
---

Your commentary here as Markdown prose. Two to four paragraphs.
Do not use headers or bullet points in the commentary.`;

const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250514',
  max_tokens: 1500,
  temperature: 0.9,
  messages: [
    {
      role: 'user',
      content: `Generate today's entry for The Daily Sublime (${today}). Select a meaningful passage and write a thoughtful commentary.`,
    },
  ],
  system: systemPrompt,
});

const output = message.content[0].text.trim();

// ---------------------------------------------------------------------------
// 5. Basic validation
// ---------------------------------------------------------------------------
if (!output.startsWith('---')) {
  console.error('ERROR: Output does not start with frontmatter delimiter');
  console.error(output.substring(0, 200));
  process.exit(1);
}

const fmEnd = output.indexOf('---', 3);
if (fmEnd === -1) {
  console.error('ERROR: No closing frontmatter delimiter found');
  process.exit(1);
}

const requiredFields = ['title:', 'date:', 'passage:', 'author:', 'source:', 'tags:'];
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
  console.error('ERROR: Commentary seems too short');
  console.error(`Body length: ${body.length} characters`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 6. Write the file
// ---------------------------------------------------------------------------
writeFileSync(outputPath, output + '\n', 'utf-8');
console.log(`Successfully generated: ${outputPath}`);
console.log(`Author: ${frontmatter.match(/^author:\s*"?(.+?)"?\s*$/m)?.[1] || 'unknown'}`);
console.log(`Body: ${body.length} characters`);
