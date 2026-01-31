import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    passage: z.string(),
    author: z.string(),
    source: z.string(),
    sourceYear: z.number().optional(),
    tags: z.array(z.string()).min(1).max(5),
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries };
