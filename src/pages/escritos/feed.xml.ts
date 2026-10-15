import type { APIRoute } from 'astro';
import { getEscritos } from '../../lib/content';
import { SITE_URL } from '../../lib/supabase';

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

export const GET: APIRoute = async () => {
  const items = await getEscritos();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>XCID — Escritos</title>
<link>${SITE_URL}/escritos</link>
<description>Ensayos de Jorge Luis Amparán sobre criterio, IA y vida.</description>
<language>es-mx</language>
${items.map((e) => `<item><title>${esc(e.titulo)}</title><link>${SITE_URL}/escritos/${e.slug}</link><guid>${SITE_URL}/escritos/${e.slug}</guid><pubDate>${new Date(e.fecha + 'T12:00:00Z').toUTCString()}</pubDate><category>${esc(e.serie)}</category><description>${esc(e.bajada ?? '')}</description></item>`).join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
