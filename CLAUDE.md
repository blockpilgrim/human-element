# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Human Element is a daily wisdom blog — curated literary/philosophical passages paired with AI-generated meditative commentary. Built as a fully static site with no database or server runtime. 

More info about the product vision can be found in `docs/the-human-element-product-spec.md`.

## Commands

```bash
npm run dev              # Dev server at http://localhost:4321
npm run build            # Build static site to dist/
npm run preview          # Preview built site locally
npm run generate         # Generate next entry as draft (requires ANTHROPIC_API_KEY)
npm run generate -- --count N  # Generate N entries in batch
npm run publish:entries  # Flip draft→published for entries with date ≤ today
```

No lint or test commands exist in this project. Requires Node.js 22+.

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

**Generation model:** Claude Opus 4.5 via Anthropic SDK with extended thinking enabled (20K token budget). Temperature 1 for maximum creativity. The script reads the last 14 entries to build an avoidance list of recent authors and tags, then constructs a system prompt incorporating themes and suggested authors from `scripts/sources.json`. Commented-out code exists for OpenRouter/Kimi K2.5; see README for switching instructions.

**Generation output validation:** The script validates LLM output before writing: checks YAML frontmatter delimiters, required fields (title, date, passage, author, source, tags), and minimum body length (>100 chars). Failures log errors but don't halt batch runs.

**Passage deduplication:** `scripts/used-passages.json` tracks all previously used passages via SHA-256 hashes. The generation script checks this registry to prevent exact passage reuse across the entire archive. This file is committed alongside entries by the GitHub Actions workflow.

**`scripts/sources.json`:** Defines 16 thematic categories, ~110 suggested authors, and the controlled tag vocabulary (~50 tags). Tags in entry frontmatter must come from this vocabulary. The generation prompt weaves these into author suggestions and thematic guidance.

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
| `/random` | `pages/random.astro` | Client-side redirect to random entry |
| `/about` | `pages/about.astro` | About page |
| `/subscribe` | `pages/subscribe.astro` | Email subscription landing page |
| `/rss.xml` | `pages/rss.xml.ts` | Full-content RSS feed |

## Styling

Single global stylesheet at `src/styles/global.css` using vanilla CSS with custom properties. Dark mode via `prefers-color-scheme` media query (no toggle). Fonts: EB Garamond (body), Cormorant Garamond (display headings), Inter (UI elements) — all self-hosted via fontsource.

## Key Patterns

- **Minimal client JS.** `RandomButton.astro` uses an inline script for random entry selection, and `EntryCard.astro` uses IntersectionObserver-based scroll animations (ornament unfurling, commentary paragraph reveals) that respect `prefers-reduced-motion`. Everything else is static HTML/CSS.
- **View transitions** via Astro's `ClientRouter` with fade animations on the main content area.
- **Adaptive passage styling:** `EntryCard.astro` applies `entry-passage--long` class for passages over 150 words.
- **RSS feed** in `rss.xml.ts` renders full markdown to HTML via `markdown-it` and sanitizes with `sanitize-html`.
- **Generation context window:** The generation script reads the last 14 entries to avoid repeating authors and themes.
- **Writing guidelines in generation prompt:** The system prompt enforces specific stylistic avoidances — no em dashes as dramatic pivots, no parallel triads, no rhetorical questions as closers, no staccato fragments, no "invites us to consider" clichés. These editorial rules are embedded directly in the prompt string in `generate-entry.mjs`.

## Environment Variables

- `ANTHROPIC_API_KEY` — Required for entry generation (set as GitHub Actions secret and locally via export)
