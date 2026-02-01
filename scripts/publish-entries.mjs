import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRIES_DIR = join(__dirname, '..', 'src', 'content', 'entries');

const today = new Date().toISOString().split('T')[0];
const files = readdirSync(ENTRIES_DIR)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort();

let published = 0;

for (const file of files) {
  const entryDate = file.replace('.md', '');

  // Only consider entries whose date has arrived
  if (entryDate > today) continue;

  const filePath = join(ENTRIES_DIR, file);
  const content = readFileSync(filePath, 'utf-8');

  // Check if this entry is still a draft
  if (!/^draft:\s*true\s*$/m.test(content)) continue;

  // Flip draft: true -> draft: false
  const updated = content.replace(/^draft:\s*true\s*$/m, 'draft: false');
  writeFileSync(filePath, updated, 'utf-8');
  console.log(`Published: ${file}`);
  published++;
}

if (published === 0) {
  console.log('No entries to publish today.');
} else {
  console.log(`Published ${published} entry/entries.`);
}
