import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../lib/md';
import { currentAdmin } from '../../lib/supabase';
export const POST: APIRoute = async ({ request, cookies }) => {
  const { isAdmin } = await currentAdmin(request, cookies);
  if (!isAdmin) return new Response('No autorizado', { status: 401 });
  const { md } = await request.json();
  return new Response(renderMarkdown(md), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
