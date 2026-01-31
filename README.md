# The Daily Sublime

A daily secular devotional — one passage from literature, poetry, or philosophy, paired with a thoughtful AI-generated reflection. Every morning. No dogma, no accounts, no ads.

Built with Astro, automated with GitHub Actions + Claude API, deployed on Netlify.

---

## Features

- **Daily entries** — Each entry contains a curated passage, attribution, 200–400 word commentary, and theme tags
- **Automated generation** — GitHub Actions runs a daily cron job that calls the Claude API, commits a new markdown file, and triggers a site rebuild
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
  → calls Claude API (Sonnet) via scripts/generate-entry.mjs
  → commits new markdown file to src/content/entries/
  → pushes to GitHub
  → Netlify detects push, rebuilds static site
  → RSS feed updates
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
| Content generation  | Claude API (Sonnet)             | ~$3–5/month   |
| Email newsletter    | Buttondown (RSS-to-email)       | Free ≤100 subscribers |

### Project structure

```
daily-sublime/
├── .github/workflows/
│   └── generate-daily.yml      # Daily cron → Claude API → commit
├── public/
│   └── favicon.svg
├── scripts/
│   ├── generate-entry.mjs      # Generation script (Claude API)
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
npm run dev       # Start dev server (http://localhost:4321)
npm run build     # Build static site to dist/
npm run preview   # Preview the built site locally
npm run generate  # Generate today's entry (requires ANTHROPIC_API_KEY)
```

### Generating an entry locally

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run generate
```

This creates a new file at `src/content/entries/YYYY-MM-DD.md` for today's date. If an entry already exists for today, it exits without changes.

The script reads the last 14 entries to avoid repeating authors and themes.

### Writing an entry by hand

Create a file at `src/content/entries/YYYY-MM-DD.md` following the frontmatter schema above. The Zod schema in `src/content.config.ts` will validate it at build time.

## Deployment — next steps

### 1. Push to GitHub

```bash
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_USERNAME/daily-sublime.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project" → select the `daily-sublime` repo
3. Netlify auto-detects Astro — build settings should be pre-filled:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Your site will be live at `https://daily-sublime.netlify.app` (or a similar subdomain)
5. Optionally set a custom domain in Site configuration → Domain management

### 3. Set up daily automation

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add a new repository secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Claude API key (get one at [console.anthropic.com](https://console.anthropic.com))
3. The workflow runs automatically at midnight UTC. To test it immediately:
   - Go to Actions → "Generate Daily Entry" → "Run workflow" → click the green button

### 4. Set up email newsletter

1. Create a [Buttondown](https://buttondown.com) account
2. Go to Settings → Automations → RSS-to-email
3. Add your RSS feed URL: `https://daily-sublime.netlify.app/rss.xml`
4. Set cadence to "every new item"
5. Enable "skip old items" to prevent back-sending existing entries
6. Update the Buttondown username in `src/components/SubscribeForm.astro` (replace `the-daily-sublime` with your actual Buttondown handle)

### 5. Optional: custom domain

If you purchase a domain (e.g., `thedailysublime.com`):

1. Add it in Netlify → Site configuration → Domain management
2. Update `site` in `astro.config.mjs` to match
3. Update the RSS feed URL in Buttondown

## Future enhancements

These are not yet implemented but are natural next steps:

- **Comments** — [Giscus](https://giscus.app) (GitHub Discussions-backed, free) for anonymous per-entry discussion
- **Search** — [Pagefind](https://pagefind.app) for static full-text search at zero runtime cost
- **Author index** — Browse entries by source author
- **Approval workflow** — Have the GitHub Action create a draft PR instead of auto-committing, so you can review before publishing
- **Batch generation** — Generate a week of entries at once for review
- **Analytics** — [Plausible](https://plausible.io) or [Fathom](https://usefathom.com) for privacy-respecting analytics
- **Dark mode** — CSS `prefers-color-scheme` media query with inverted warm tones

## Content curation

The generation script (`scripts/generate-entry.mjs`) draws from a wide range of traditions:

- Stoic, Epicurean, and existentialist philosophy
- Romantic and transcendentalist poetry
- Zen Buddhism, Taoism, Sufism
- Contemporary poetry and nature writing
- Mystics read as literature

The curated reference list in `scripts/sources.json` guides variety but doesn't limit the AI — it can draw from its full training data. The script tracks recent authors and themes to avoid repetition.

### Editing the generation prompt

The system prompt is defined inline in `scripts/generate-entry.mjs`. Key knobs to adjust:

- `temperature: 0.9` — Controls creative variety (higher = more varied selections)
- The avoidance rules (recent authors/themes) are built dynamically from the last 14 entries
- The tag vocabulary in `sources.json` can be expanded
- Commentary length, tone, and structure guidelines are in the system prompt

## License

Content is generated daily and may include passages under copyright. Short excerpts paired with transformative commentary likely qualify as fair use, but this should be reviewed if the project grows.
