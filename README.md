# The Human Element

Daily wisdom for creative humans in the age of AI — one passage from literature, philosophy, or contemporary thought, paired with a meditative AI-generated reflection. Every morning. No accounts, no ads.

Built with Astro, automated with GitHub Actions + LLM API (currently Kimi K2.5 via OpenRouter), deployed on Netlify.

---

## Features

- **Daily entries** — Each entry contains a curated passage, attribution, 200–400 word commentary, and theme tags
- **Automated generation** — GitHub Actions runs a daily cron job that calls an LLM API, commits a new markdown file, and triggers a site rebuild
- **Archive** — Browse past entries in a reverse-chronological list view or a monthly calendar grid
- **Theme tags** — Entries are tagged (e.g., "mortality," "attention," "wonder") with browsable tag pages
- **RSS feed** — Full-content feed at `/rss.xml` for feed readers
- **Email subscription** — Buttondown RSS-to-email integration (no accounts, no tracking)
- **Random entry** — JS-enhanced random selection with a no-JS fallback
- **Accessible** — Semantic HTML, skip links, ARIA labels, screen reader friendly
- **Zero JavaScript by default** — Only the random button loads a tiny inline script; everything else is static HTML + CSS

## Architecture

```
GitHub Actions (daily cron, midnight UTC)
  → publishes any due draft entries (scripts/publish-entries.mjs)
  → generates next day's entry as draft (scripts/generate-entry.mjs)
  → commits changes and pushes to GitHub
  → Netlify detects push, rebuilds static site
  → RSS feed updates (only published entries)
  → Buttondown detects RSS update, sends email to subscribers
```

No database. No server. Just Git + APIs + static hosting.

### Tech stack

| Layer               | Tool                            | Cost          |
|---------------------|---------------------------------|---------------|
| Framework           | Astro 5 (static output)         | Free          |
| Styling             | Vanilla CSS + custom properties | Free          |
| Fonts               | Source Serif 4 + Inter (self-hosted via fontsource) | Free |
| Content             | Markdown files with Zod-validated frontmatter | Free |
| Hosting             | Netlify                         | Free          |
| Automation          | GitHub Actions                  | Free          |
| Content generation  | Kimi K2.5 via [OpenRouter](https://openrouter.ai/moonshotai/kimi-k2.5) | ~$1–3/month |
| Email newsletter    | Buttondown (RSS-to-email)       | Free ≤100 subscribers |

### Project structure

```
human-element/
├── .github/workflows/
│   └── generate-daily.yml      # Daily cron → LLM API → commit
├── public/
│   └── favicon.svg
├── scripts/
│   ├── generate-entry.mjs      # Generation script (OpenRouter / Kimi K2.5)
│   ├── publish-entries.mjs     # Publishes draft entries whose date has arrived
│   └── sources.json            # Curated author/theme reference
├── src/
│   ├── content/
│   │   └── entries/            # One markdown file per day (YYYY-MM-DD.md)
│   ├── content.config.ts       # Zod schema for entry frontmatter
│   ├── components/             # Astro components (EntryCard, CalendarGrid, etc.)
│   ├── layouts/                # BaseLayout, EntryLayout, PageLayout
│   ├── pages/                  # All routes (index, archive, entry, tags, etc.)
│   └── styles/
│       └── global.css          # Full design system
├── astro.config.mjs
├── netlify.toml
├── package.json
└── tsconfig.json
```

### Entry format

Each entry is a markdown file at `src/content/entries/YYYY-MM-DD.md`:

```yaml
---
title: "Short Evocative Title"
date: 2026-01-31
passage: |
  The quoted passage here,
  preserving line breaks for poetry.
author: "Author Name"
source: "Title of Work"
sourceYear: 1986          # optional
tags:
  - wonder
  - mortality
draft: false
---

Commentary as Markdown prose (200–400 words).
```

## Local development

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
npm install
```

### Commands

```bash
npm run dev              # Start dev server (http://localhost:4321)
npm run build            # Build static site to dist/
npm run preview          # Preview the built site locally
npm run generate         # Generate next entry as draft (requires OPENROUTER_API_KEY)
npm run generate -- --count 3  # Generate multiple upcoming entries
npm run publish:entries  # Publish draft entries whose date has arrived
```

### Generating entries locally

```bash
export OPENROUTER_API_KEY=sk-or-...
npm run generate              # Generate one entry
npm run generate -- --count 5 # Generate five entries
```

Each run creates a new entry dated one day after the latest existing entry, with `draft: true`. Run it multiple times (or use `--count`) to build up a buffer of staged entries for review.

To publish entries whose date has arrived:

```bash
npm run publish:entries
```

This flips `draft: true` → `draft: false` for any entry where the date is today or earlier. Draft entries are hidden from the site, RSS feed, and all public pages.

The generation script reads the last 14 entries to avoid repeating authors and themes.

### Writing an entry by hand

Create a file at `src/content/entries/YYYY-MM-DD.md` following the frontmatter schema above. The Zod schema in `src/content.config.ts` will validate it at build time.

## Deployment — next steps

### 1. Push to GitHub

```bash
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USERNAME/human-element.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project" → select the `human-element` repo
3. Netlify auto-detects Astro — build settings should be pre-filled:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Your site will be live at `https://human-element.netlify.app` (or a similar subdomain)
5. Optionally set a custom domain in Site configuration → Domain management

### 3. Set up daily automation

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add a new repository secret:
   - Name: `OPENROUTER_API_KEY`
   - Value: your OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))
3. The workflow runs automatically at midnight UTC. To test it immediately:
   - Go to Actions → "Generate Daily Entry" → "Run workflow" → click the green button

### 4. Set up email newsletter

1. Create a [Buttondown](https://buttondown.com) account
2. Go to Settings → Automations → RSS-to-email
3. Add your RSS feed URL: `https://human-element.netlify.app/rss.xml`
4. Set cadence to "every new item"
5. Enable "skip old items" to prevent back-sending existing entries
6. Update the Buttondown username in `src/components/SubscribeForm.astro` (replace `the-human-element` with your actual Buttondown handle)

### 5. Optional: custom domain

If you purchase a domain (e.g., `thehumanelement.blog`):

1. Add it in Netlify → Site configuration → Domain management
2. Update `site` in `astro.config.mjs` to match
3. Update the RSS feed URL in Buttondown

## Future enhancements

These are not yet implemented but are natural next steps:

- **Comments** — [Giscus](https://giscus.app) (GitHub Discussions-backed, free) for anonymous per-entry discussion
- **Search** — [Pagefind](https://pagefind.app) for static full-text search at zero runtime cost
- **Author index** — Browse entries by source author
- ~~**Approval workflow** — Have the GitHub Action create a draft PR instead of auto-committing, so you can review before publishing~~ (implemented via draft staging)
- ~~**Batch generation** — Generate a week of entries at once for review~~ (implemented via `--count` flag)
- **Analytics** — [Plausible](https://plausible.io) or [Fathom](https://usefathom.com) for privacy-respecting analytics
- **Dark mode** — ~~CSS `prefers-color-scheme` media query with inverted warm tones~~ (implemented)

## Content curation

The generation script (`scripts/generate-entry.mjs`) draws from a wide range of traditions:

- Philosophy on craft, technology, and creativity (Heidegger, Arendt, Camus)
- Letters and essays on the creative life (Rilke, Woolf, Keats)
- Writings on attention and presence (Simone Weil, Mary Oliver, Annie Dillard)
- Historical responses to new technologies (Socrates on writing, Benjamin on photography)
- Contemporary voices on creativity and making (Austin Kleon, Jenny Odell, George Saunders)

The curated reference list in `scripts/sources.json` guides variety but doesn't limit the AI — it can draw from its full training data. The script tracks recent authors and themes to avoid repetition.

### Editing the generation prompt

The system prompt is defined inline in `scripts/generate-entry.mjs`. Key knobs to adjust:

- `temperature: 0.9` — Controls creative variety (higher = more varied selections)
- The avoidance rules (recent authors/themes) are built dynamically from the last 14 entries
- The tag vocabulary in `sources.json` can be expanded
- Commentary length, tone, and structure guidelines are in the system prompt

## Switching LLM providers

The generation script currently uses **Kimi K2.5** via OpenRouter. The previous Claude (Anthropic) code is commented out in `scripts/generate-entry.mjs` and `.github/workflows/generate-daily.yml` so you can switch back easily.

### Switching back to Claude (Anthropic)

In `scripts/generate-entry.mjs`:

1. **Imports** — Uncomment the Anthropic import, comment out the OpenAI import:
   ```js
   import Anthropic from '@anthropic-ai/sdk';
   // import OpenAI from 'openai';
   ```

2. **Client** — Uncomment the Anthropic client, comment out the OpenRouter client:
   ```js
   const client = new Anthropic();
   // const client = new OpenAI({ ... });
   ```

3. **API call** — Uncomment the Claude `client.messages.create(...)` block and its `output` line, comment out the OpenRouter `client.chat.completions.create(...)` block and its `output` line. The key differences:
   - Claude uses `client.messages.create()` with a separate `system` parameter
   - OpenRouter uses `client.chat.completions.create()` with `system` as a message role
   - Claude response: `message.content[0].text`
   - OpenRouter response: `message.choices[0].message.content`

In `.github/workflows/generate-daily.yml`:

4. Swap the env var:
   ```yaml
   env:
     ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
     # OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
   ```

5. Make sure `ANTHROPIC_API_KEY` is set as a GitHub Actions secret (and locally via `export ANTHROPIC_API_KEY=sk-ant-...`).

### Using a different model on OpenRouter

To try another model without changing any plumbing, just swap the model ID in the API call:

```js
model: 'moonshotai/kimi-k2.5',          // current
model: 'anthropic/claude-sonnet-4',      // Claude Sonnet via OpenRouter
model: 'google/gemini-2.5-pro-preview',  // Gemini via OpenRouter
model: 'openai/gpt-4o',                  // GPT-4o via OpenRouter
```

Browse available models at [openrouter.ai/models](https://openrouter.ai/models). No other code changes needed — the OpenAI SDK format works for all OpenRouter models.

## License

Content is generated daily and may include passages under copyright. Short excerpts paired with transformative commentary likely qualify as fair use, but this should be reviewed if the project grows.
