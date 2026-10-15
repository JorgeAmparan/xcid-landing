import type { APIRoute } from 'astro';
import { currentAdmin, SUPABASE_URL } from '../../lib/supabase';
import { slugify } from '../../lib/md';
export const POST: APIRoute = async ({ request, cookies }) => {
  const { sb, isAdmin } = await currentAdmin(request, cookies);
  if (!isAdmin || !sb) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file || !file.type.startsWith('image/')) return new Response(JSON.stringify({ error: 'Solo imágenes' }), { status: 400 });
  if (file.size > 8 * 1024 * 1024) return new Response(JSON.stringify({ error: 'Máximo 8 MB' }), { status: 400 });
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${new Date().toISOString().slice(0, 10)}/${slugify(file.name.replace(/\.[^.]+$/, '')) || 'imagen'}-${Date.now().toString(36)}.${ext}`;
  const { error } = await sb.storage.from('imagenes').upload(path, file, { contentType: file.type, upsert: false });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const url = `${SUPABASE_URL}/storage/v1/object/public/imagenes/${path}`;
  return new Response(JSON.stringify({ url }), { headers: { 'Content-Type': 'application/json' } });
};
