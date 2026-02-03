import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * The Human Element - Entry Schema
 *
 * Each entry consists of:
 * - A curated passage (literature, philosophy, essays on craft)
 * - AI-generated meditative commentary
 * - Metadata for attribution and navigation
 */
const entries = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/entries" }),
  schema: z.object({
    // Display title for the entry (short, evocative)
    title: z.string(),

    // Publication date
    date: z.coerce.date(),

    // The curated passage (poetry, prose, excerpt)
    passage: z.string(),

    // Attribution
    author: z.string(),
    source: z.string(),
    sourceYear: z.string().optional(),

    // Copyright handling
    // true = copyrighted excerpt (fair use), false = full public domain text
    excerpt: z.boolean().default(false),

    // Link to full text (only for excerpts where URL is known)
    passageLink: z.string().url().optional(),

    // Thematic tags (2-4 from controlled vocabulary)
    tags: z.array(z.string()).min(1).max(5),

    // Draft status (generated entries start as drafts)
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries };
