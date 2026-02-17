# The Human Element

**Daily wisdom for creative humans in the age of AI.** One passage from literature, philosophy, or contemporary thought, paired with a meditative AI-generated reflection. Every morning. No accounts, no ads.

**Live at [human-element.netlify.app](https://human-element.netlify.app)**

## What It Does

The Human Element is a fully automated daily wisdom blog. Each morning, a GitHub Actions workflow calls Claude Opus 4.5 (with extended thinking enabled) to select a literary or philosophical passage and write a meditative commentary connecting it to the experience of being a creative human in the age of AI. The entry is committed to the repo, Netlify rebuilds the static site, and subscribers receive it via RSS or email.

The content draws from sources like Rilke, Simone Weil, Annie Dillard, Camus, Virginia Woolf, and dozens of contemporary voices — curated from a reference corpus of ~110 authors across 16 thematic categories. A deduplication system tracks all previously used passages via SHA-256 hashes to prevent repeats across the entire archive.

There's no database, no server runtime, and no manual intervention. The entire pipeline runs on Git commits, API calls, and static hosting.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | [Astro 5](https://astro.build) (fully static output, zero client JS by default) |
| Content generation | Claude Opus 4.5 via [Anthropic SDK](https://docs.anthropic.com/en/docs/sdks) with extended thinking (20K token budget) |
| Content format | Markdown with Zod-validated YAML frontmatter |
| Automation | GitHub Actions (daily cron at midnight UTC) |
| Hosting | Netlify (auto-rebuilds on push) |
| Email | [Buttondown](https://buttondown.com) RSS-to-email integration |
| Styling | Vanilla CSS design system with custom properties, dark mode via `prefers-color-scheme` |
| Typography | EB Garamond, Cormorant Garamond, Inter (self-hosted via fontsource) |

## Architecture

```
GitHub Actions (daily cron, midnight UTC)
  1. Publishes any due draft entries (flips draft → published for entries with date ≤ today)
  2. Generates next day's entry as draft via Claude Opus 4.5
  3. Validates output: checks frontmatter structure, required fields, minimum body length
  4. Checks passage against SHA-256 deduplication registry
  5. Commits new entry + updated registry, pushes to GitHub
  6. Netlify detects push → rebuilds static site
  7. RSS feed updates → Buttondown sends email to subscribers
```

The generation script builds context from the last 14 entries to avoid repeating authors and themes, and uses a detailed system prompt with editorial guidelines — specific stylistic rules, copyright handling for public domain vs. fair-use excerpts, and a controlled tag vocabulary.

### Key design decisions

- **Draft staging**: Entries are generated one day ahead as drafts, then published when their date arrives. This creates a buffer for review without blocking automation.
- **Passage deduplication**: Every passage is hashed and stored in a committed JSON registry, preventing exact reuse across the entire archive.
- **Zero client JavaScript**: The only JS is a tiny inline script for the random entry button and IntersectionObserver-based scroll animations (which respect `prefers-reduced-motion`). Everything else is static HTML/CSS.
- **Security headers**: Netlify config includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict referrer policy.

## Getting Started

Requires Node.js 22+.

```bash
npm install
npm run dev              # Dev server at http://localhost:4321
npm run build            # Build static site to dist/
npm run generate         # Generate next entry (requires ANTHROPIC_API_KEY)
npm run generate -- --count 5  # Generate multiple entries in batch
npm run publish:entries  # Publish entries whose date has arrived
```

## Status

Shipped and running in production since January 2026. New entries are generated and published daily via automation. The site has 28+ entries in its archive with email subscribers receiving daily updates via Buttondown.

## License

MIT (source code). Content passages may include excerpts under copyright; short excerpts paired with transformative commentary are used under fair use.
