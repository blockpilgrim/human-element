# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Human Element is a daily wisdom blog — curated literary/philosophical passages paired with AI-generated meditative commentary. Built as a fully static site with no database or server runtime.

## Commands

```bash
npm run dev              # Dev server at http://localhost:4321
npm run build            # Build static site to dist/
npm run preview          # Preview built site locally
npm run generate         # Generate next entry as draft (requires ANTHROPIC_API_KEY)
npm run generate -- --count N  # Generate N entries in batch
npm run publish:entries  # Flip draft→published for entries with date ≤ today
```

No lint or test commands exist in this project.

## Architecture

**Stack:** Astro 5 (static output) + vanilla CSS + Netlify hosting + GitHub Actions automation.

**Content pipeline:**
1. `scripts/generate-entry.mjs` calls the Anthropic API (Claude) to create a markdown entry with `draft: true`
2. `scripts/publish-entries.mjs` flips `draft: true → false` for entries whose date has arrived
3. GitHub Actions cron (`0 0 * * *` UTC) runs both scripts daily, commits, and pushes
4. Netlify auto-rebuilds on push; RSS feed updates; Buttondown sends email to subscribers

**Content Collections:** Entries live at `src/content/entries/YYYY-MM-DD.md` with Zod-validated frontmatter defined in `src/content.config.ts`. All pages query entries via Astro's `getCollection('entries')`, filtering out drafts.

**Entry frontmatter schema:**
- `title`, `date`, `passage`, `author`, `source` (required)
- `sourceYear`, `passageLink` (optional)
- `excerpt` (boolean, default false — true for copyrighted excerpts under fair use)
- `tags` (1-5 strings from controlled vocabulary in `scripts/sources.json`)
- `draft` (boolean, default false)

**LLM provider switching:** The generation script currently uses Anthropic directly. Commented-out code exists for OpenRouter/Kimi K2.5. Both patterns are in `scripts/generate-entry.mjs` and `.github/workflows/generate-daily.yml`. See README for switching instructions.

## Routing

All routes are statically generated at build time. No SSR.

| Path | File | Description |
|------|------|-------------|
| `/` | `pages/index.astro` | Latest published entry |
| `/entry/YYYY-MM-DD` | `pages/entry/[...slug].astro` | Individual entry with prev/next nav |
| `/archive` | `pages/archive/index.astro` | Reverse-chronological list |
| `/archive/calendar` | `pages/archive/calendar.astro` | Monthly calendar grid |
| `/tags` | `pages/tags/index.astro` | All tags with counts |
| `/tags/[tag]` | `pages/tags/[tag].astro` | Entries filtered by tag |
| `/random` | `pages/random.astro` | Server-side redirect to random entry |
| `/rss.xml` | `pages/rss.xml.ts` | Full-content RSS feed |

## Styling

Single global stylesheet at `src/styles/global.css` using vanilla CSS with custom properties. Dark mode via `prefers-color-scheme` media query (no toggle). Fonts: EB Garamond (body), Cormorant Garamond (display headings), Inter (UI elements) — all self-hosted via fontsource.

## Key Patterns

- **Zero client JS by default.** Only `RandomButton.astro` uses an inline script. Everything else is static HTML/CSS.
- **View transitions** via Astro's `ClientRouter` with fade animations on the main content area.
- **Adaptive passage styling:** `EntryCard.astro` applies `entry-passage--long` class for passages over 150 words.
- **RSS feed** in `rss.xml.ts` renders full markdown to HTML via `markdown-it` and sanitizes with `sanitize-html`.
- **Generation context window:** The generation script reads the last 14 entries to avoid repeating authors and themes.

## Environment Variables

- `ANTHROPIC_API_KEY` — Required for entry generation (set as GitHub Actions secret and locally via export)
