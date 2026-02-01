# The Daily Sublime

## Product Specification

---

## 1. Vision & Purpose

**The Daily Sublime** is a digital secular devotional—a daily blog that offers a curated passage from literature, poetry, or philosophy, paired with thoughtful AI-generated commentary. It serves readers who feel spiritual longing but don't find a home in traditional religion: the "nones," the skeptics, the Spinoza-curious, the lapsed believers, the atheists who still cry at sunsets.

The project aims to:

- Provide a moment of daily reflection, grounding, or elevation
- Surface the vast wealth of human writing that speaks to wonder, mortality, meaning, and presence—without dogma
- Build a quiet community around shared contemplation
- Demonstrate that the sacred can be found in attention, not belief

**Tagline options:**
- *A year of wonder for the unaffiliated soul*
- *Daily meditations on awe, mortality, and meaning*
- *Literature and philosophy for secular reverence*

---

## 2. Target Audience

### Primary

- **Secular spirituals (ages 25–55):** People who identify as atheist, agnostic, "spiritual but not religious," or simply unaffiliated—but who still seek depth, meaning, and moments of transcendence
- **Readers and autodidacts:** People who love literature, poetry, and philosophy, and enjoy discovering new authors or revisiting classics in fresh contexts
- **Meditation/mindfulness-adjacent:** People familiar with apps like Headspace or Calm, or practices like journaling, who want something more literary and less prescriptive

### Secondary

- **Believers with ecumenical tastes:** Religious people comfortable with secular or cross-traditional wisdom
- **Writers and creatives:** People who draw inspiration from poetic language and ideas
- **Grief and transition:** People navigating loss, mortality, life changes—seeking consolation outside religious frameworks

### Psychographic profile

They might have Ryan Holiday's *The Daily Stoic* on their shelf. They might have left a childhood religion. They probably have a complicated relationship with the word "God." They want something to read with their morning coffee that isn't the news.

---

## 3. Core Features

### 3.1 Daily Entry

Each day, the site displays a single entry consisting of:

| Component | Description |
|-----------|-------------|
| **Date** | The calendar date (e.g., "January 15") |
| **Passage** | A curated excerpt from literature, poetry, or philosophy (typically 50–300 words) |
| **Attribution** | Author, title of work, and (where relevant) translator or edition |
| **Commentary** | An AI-generated meditative reflection (200–500 words) |
| **Theme tags** | Optional subtle tags (e.g., "mortality," "attention," "cosmos") for future filtering/browsing |

**Display behavior:**

- The current day's entry is the default landing page
- Previous entries are accessible via archive/calendar navigation
- Entries remain permanently available (evergreen content)

### 3.2 Archive & Navigation

- **Calendar view:** Browse by month/day (à la traditional "book of days" format)
- **List view:** Reverse-chronological list of past entries
- **Theme/tag filtering (v2):** Browse by theme (e.g., "mortality," "nature," "meaning-making")
- **Author index (v2):** Browse all entries by source author
- **Search (v2):** Full-text search across passages and commentary
- **Random entry:** "Give me any day" button for serendipitous reflection

### 3.3 Anonymous Comments

Each daily entry has its own comment thread. Key characteristics:

| Feature | Description |
|---------|-------------|
| **Anonymous by default** | No accounts, no emails, no sign-up friction |
| **Auto-generated pseudonyms** | Users assigned names like "anon-1," "anon-2," etc., scoped to that day's thread |
| **Persistent within thread** | If "anon-3" comments twice in the same thread, they remain "anon-3" (via cookie/local storage) |
| **No cross-thread identity** | The same person is a different anon in a different day's thread |
| **Minimal UI** | Simple text box, submit button, flat thread (no nesting in v1) |
| **Moderation** | Basic profanity filter; manual moderation queue for flagged comments; report button |

**Tone/culture goal:** The comment section should feel like a quiet chapel, not a forum. Prompting copy can set this tone: *"If this moved you, you're welcome to leave a thought. No account needed."*

### 3.4 Subscription / Notifications

- **Email newsletter:** Optional daily or weekly email with the entry (plain text or simple HTML)
- **RSS feed:** For readers who prefer RSS
- **No account required:** Email subscription is the only optional data collection

---

## 4. Content System

### 4.1 Passage Corpus

Passages are selected on an ongoing basis from the traditions below. No need to curate everything upfront—discovery is part of the process.

**Source traditions to draw from:**

- Romantic poetry (Wordsworth, Keats, Shelley, Blake)
- American transcendentalists (Whitman, Emerson, Thoreau, Dickinson)
- 20th-century poetry (Rilke, Stevens, Mary Oliver, R.S. Thomas, Robinson Jeffers, W.S. Merwin)
- Contemporary poetry (Louise Glück, Jack Gilbert, Jane Hirshfield, Wisława Szymborska)
- Classical philosophy (Marcus Aurelius, Seneca, Epictetus, Lucretius, Epicurus)
- Existentialism & absurdism (Camus, Nietzsche, Kierkegaard, Sartre, Simone de Beauvoir)
- Eastern traditions (Tao Te Ching, Chuang Tzu, Rumi, Hafiz, Bashō, Buddhist sutras)
- Nature & science writing (Annie Dillard, Loren Eiseley, Lewis Thomas, Rachel Carson, Carl Sagan)
- Essayists & aphorists (Montaigne, Pascal, Cioran, Fernando Pessoa, Borges)
- Religious mystics read secularly (Meister Eckhart, Simone Weil, Thomas Merton)

**Thematic range:**

- Wonder / awe / the sublime
- Mortality / impermanence / finitude
- Nature as sacred
- Cosmos / vastness / scale
- Attention / presence / wakefulness
- Meaning-making / purpose without teleology
- Solitude / interiority
- Love / connection / the other
- Suffering / consolation / acceptance
- Joy / gratitude / enough-ness

**In practice:** Use the Claude prompt (see Appendix) to generate entries. Over time, you'll naturally develop a sense of what works and build a mental library.

### 4.2 Commentary Generation

Each passage is paired with AI-generated commentary. Characteristics:

- **Tone:** Warm, meditative, unhurried. Not academic, not preachy.
- **Length:** 200–500 words (roughly 1–3 minutes to read)
- **Structure:** Flowing prose, not bullet points. May include:
  - Context on the author or work (brief, only if illuminating)
  - Close attention to specific lines or images
  - Existential or emotional resonance—what this opens up
  - Connections to daily life, ordinary mornings, the reader's possible state
  - Occasional question or invitation at the end (not required)
- **What to avoid:**
  - Lecturing or explaining "the meaning"
  - Forced uplift or toxic positivity
  - Repetitive structures ("This passage invites us to consider...")
  - Over-quoting the passage back at the reader

### 4.3 Content Pipeline

**Launch requirement:** 1 entry. Ship with one, add daily thereafter via automation.

---

**Automated daily flow (MVP):**

```
GitHub Actions cron (free, runs daily)
    ↓
Calls Claude API with generation prompt
    ↓
Receives passage + commentary
    ↓
Commits new markdown file to repo
    ↓
Vercel/Netlify detects commit → rebuilds site (free)
    ↓
RSS feed updates automatically
    ↓
Buttondown/Mailchimp detects RSS update → sends email to subscribers (free tier)
```

**No approval gate for MVP.** Entries auto-publish. If something's off, manually edit or delete (expected to be rare).

---

**Cost:**

| Component | Cost |
|-----------|------|
| GitHub Actions | Free |
| Claude API (Sonnet) | ~$0.01/entry → ~$3–5/month |
| Vercel/Netlify hosting | Free |
| Buttondown (email) | Free up to 100 subscribers |
| **Total** | **~$3–5/month** |

---

**Future improvements (post-MVP):**

| Improvement | How |
|-------------|-----|
| **Lightweight approval** | GitHub Actions creates a draft PR instead of auto-committing; you merge to publish (one click) |
| **Mobile approval** | Bot sends entry to Telegram; you react 👍 to approve |
| **Batch generation** | Generate a week's worth, review at leisure, schedule publishing |
| **Quality control** | Add a second Claude call to self-critique before publishing |
| **Buffer management** | Dashboard showing upcoming entries, ability to reorder/edit |

---

**The generation prompt** (see Appendix A) is called by the GitHub Action. The prompt can be varied over time to avoid repetition—e.g., rotating through themes, specifying "don't repeat authors from the last 7 days," etc.

---

## 5. Information Architecture

```
Homepage (Today's Entry)
│
├── Entry Display
│   ├── Date
│   ├── Passage + Attribution
│   ├── Commentary
│   ├── Theme Tags
│   └── Comment Thread
│
├── Archive
│   ├── Calendar View (by month)
│   ├── List View (reverse-chron)
│   ├── [v2] Tag/Theme Index
│   └── [v2] Author Index
│
├── Random Entry
│
├── About
│   ├── What is this?
│   ├── Who is this for?
│   └── How entries are selected
│
├── Subscribe
│   ├── Email signup
│   └── RSS link
│
└── [v2] Search
```

---

## 6. Design Principles

### 6.1 Visual Design

- **Minimal and quiet:** Generous whitespace, restrained palette, no visual clutter
- **Typographically rich:** Beautiful, readable serif fonts for passages; clean sans-serif for UI
- **No ads, no pop-ups, no dark patterns:** Respect for the reader's attention
- **Reading-first:** The passage and commentary should dominate; navigation is secondary
- **Responsive:** Equally contemplative on mobile and desktop

**Mood references:**

- The quietness of a library
- The simplicity of a Quaker meeting house
- The aesthetic of *The Marginalian* (Brain Pickings) or *Aeon* magazine

### 6.2 Interaction Design

- **Slow, not sticky:** No infinite scroll, no engagement hacks. One entry per day is enough.
- **Frictionless comments:** No sign-up, no CAPTCHA unless abuse requires it
- **Graceful degradation:** Works without JavaScript where possible
- **Accessible:** Proper semantic HTML, alt text, screen reader friendly

### 6.3 Voice & Tone

- **Warm but not saccharine**
- **Intelligent but not academic**
- **Reverent but not religious**
- **Inviting but not desperate for engagement**

Copy throughout the site (buttons, prompts, about page) should feel like it was written by a thoughtful person, not a marketing team.

---

## 7. Technical Considerations (High-Level)

*Detailed architecture belongs in the implementation plan. Guiding principle: simplest thing that works, all free or near-free.*

### 7.1 The Stack (Recommended)

| Layer | Tool | Cost |
|-------|------|------|
| **Automation** | GitHub Actions | Free |
| **Content generation** | Claude API (Sonnet) | ~$3–5/month |
| **Site framework** | Astro, 11ty, or Next.js | Free |
| **Content format** | Markdown files in repo | Free |
| **Hosting** | Vercel or Netlify | Free |
| **Email newsletter** | Buttondown (RSS-to-email) | Free up to 100 subs |
| **RSS** | Auto-generated by framework | Free |

### 7.2 How It Fits Together

1. **GitHub repo** holds the site code + markdown entries
2. **GitHub Actions** runs daily cron → calls Claude API → commits new `.md` file
3. **Vercel/Netlify** watches repo → rebuilds on new commits
4. **RSS feed** is generated at build time
5. **Buttondown** watches RSS → sends email when new entry detected

No database. No server. No n8n. Just Git + APIs + static hosting.

### 7.3 Phase 2+ Additions

| Feature | Simple Options |
|---------|----------------|
| **Comments** | Giscus (GitHub Discussions-based, free) or simple self-hosted |
| **Moderation** | GitHub interface or lightweight admin page |
| **Analytics** | Plausible, Fathom, or none |
| **Search** | Pagefind (static search, free) |

### 7.4 API Key Security

- Store Claude API key as a **GitHub secret**
- Never commit it to the repo
- GitHub Actions accesses it securely at runtime

---

## 8. Success Metrics

### Phase 0–1: Just Ship

The only metric that matters at first: **Is it live? Is there a new entry today?**

### Later: Signs of Life

| Signal | What it tells you |
|--------|-------------------|
| Someone subscribes | People want this in their inbox |
| Someone comments | People feel moved enough to respond |
| Someone shares an entry | It resonated enough to pass along |
| You enjoy making it | This is sustainable |

### Eventually: Quantitative (tracked lightly)

| Metric | Target (Year 1) |
|--------|-----------------|
| Daily unique visitors | 500+ |
| Email subscribers | 1,000+ |
| Return visitor rate | 40%+ |

Don't over-instrument early. Focus on making something good and showing up daily.

---

## 9. Roadmap / Phases

### Phase 0: Ship It (Today)

- One entry live on a public URL
- Basic page layout: passage, attribution, commentary
- Can be manually created—just get something live
- **Goal:** Prove you can ship. URL exists. Entry is readable.

### Phase 1: Automate (Days 2–7)

- Set up GitHub Actions → Claude API → auto-commit flow
- Daily entry generation runs automatically
- Site rebuilds on each new entry
- RSS feed works
- Email subscription via Buttondown (RSS-to-email)
- Basic archive (list of past entries)
- About page
- **Goal:** Hands-off daily publishing. You wake up, entry is live.

### Phase 2: Community (Week 2–4)

- Anonymous commenting (auto-generated pseudonyms via Giscus or custom)
- Basic moderation
- "Random entry" button
- Calendar view for archive
- **Goal:** Readers can respond and explore.

### Phase 3: Discovery & Polish (Month 2+)

- Theme/tag filtering
- Author index
- Search functionality
- Design polish (typography, spacing, mobile refinements)

### Phase 4: Expansion & Sustainability (Month 6+)

- Approval workflow (optional, if quality variance is an issue)
- Potential print anthology
- Potential audio/podcast version
- Patronage model (optional donations)
- Community features (weekly discussion threads, etc.)

---

## 10. Open Questions

- **Calendar assignment:** Should entries be tied to specific dates (with seasonal logic) or randomly assigned? Does January 1 need to be about beginnings?
- **Time zone:** What time zone defines "today"? Or should the site detect local time?
- **Pseudonym style:** "anon-1" or something warmer? ("wanderer-7," "pilgrim-3," etc.)
- **Moderation capacity:** Who moderates comments, and how much time is realistic?
- **Attribution & copyright:** Some passages may be under copyright. Fair use likely applies (short excerpts + commentary = transformative), but this should be reviewed.
- **AI disclosure:** Should the site explicitly state that commentary is AI-generated? (Recommendation: yes, with a brief explanation in the About page.)

---

## 11. Appendix

### A. The Generation Prompt

Use this prompt (or a variation) to generate entries:

> I'm looking for a daily reflection in the spirit of secular spirituality. Please share a passage, poem, or quote—drawn from literature, poetry, or philosophy—that speaks to one or more of the following sensibilities:
>
> - Wonder or awe at existence itself, without reference to a traditional personal god
> - The sacred or numinous found in nature, the cosmos, or ordinary life
> - Making meaning in a universe without inherent purpose (existentialism, absurdism, Stoicism, Epicureanism)
> - Acceptance of mortality and impermanence as a source of depth rather than despair
> - The "god" of Spinoza or Einstein—the laws and structure of reality, the whole of which we are a part
> - Presence, attention, and the texture of lived experience
>
> Draw from a wide range of sources: Whitman, Rilke, Mary Oliver, Wallace Stevens, Emily Dickinson, Lucretius, Marcus Aurelius, Camus, Nietzsche, the Tao Te Ching, Rumi, Pessoa, Borges, Annie Dillard, Robinson Jeffers, and others in this vein. Vary your selections—don't repeat what you've shared before in this conversation.
>
> After sharing the passage, provide a meditative commentary: not academic analysis, but a slow, thoughtful reflection on what the passage opens up, how it might sit with someone on an ordinary morning, and what it invites us to notice or feel. You may end with a question or gentle invitation, but this isn't required.

**Optional modifiers:**

- *"Today I'm feeling [melancholy / restless / grateful / small / expansive]—choose something that meets or speaks to that mood."*
- *"Lean toward something [short and stark / longer and immersive / strange and disorienting / quiet and grounding]."*
- *"Include something I probably haven't encountered before."*

---

### B. Sample Entry

**January 15**

---

**Passage**

> "You do not have to be good.
> You do not have to walk on your knees
> for a hundred miles through the desert repenting.
> You only have to let the soft animal of your body
> love what it loves."

— Mary Oliver, "Wild Geese"

---

**Commentary**

There's a reason this poem has been pinned to so many refrigerators, read at so many funerals, whispered to so many people in crisis. It offers permission. And permission, it turns out, is what many of us most desperately need.

"You do not have to be good." What a strange way to begin. We expect poems to tell us to be better—kinder, more disciplined, more worthy. But Oliver starts by releasing us from the whole project. Not because goodness doesn't matter, but because the striving, the self-flagellation, the hundred-mile crawl through the desert of our own judgment—this is not the path.

The path, she suggests, is through the body. Through letting it "love what it loves." This is not hedonism. It's something closer to trust. The soft animal of your body knows things. It knows what it's drawn to, what makes it come alive, what feels like home. And so much of life is spent overriding those signals in favor of what we think we should want.

This morning, you might ask: what does the soft animal of my body love? Not what should I love. Not what would be impressive to love. Just: what do I actually love? And can I let myself move toward it, even a little?

---

**Tags:** permission, body, self-compassion, nature

---

*End of document.*
