import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import type { APIContext } from 'astro';

const parser = new MarkdownIt();

export async function GET(context: APIContext) {
  const entries = await getCollection('entries', ({ data }) => !data.draft);
  const sorted = entries.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'The Human Element',
    description:
      'Daily wisdom for creative humans in the age of AI. One passage. One reflection. Every morning.',
    site: context.site!.toString(),
    items: sorted.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      link: `/entry/${entry.id}`,
      description: `"${entry.data.passage.trim().slice(0, 200)}..." — ${entry.data.author}`,
      content: sanitizeHtml(
        `<blockquote>${parser.render(entry.data.passage.trim())}</blockquote>
         <p><em>— ${entry.data.author}, ${entry.data.source}</em></p>
         <hr />
         ${parser.render(entry.body || '')}`,
        {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }
      ),
    })),
    customData: '<language>en-us</language>',
  });
}
