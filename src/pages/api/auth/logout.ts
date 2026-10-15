import type { APIRoute } from 'astro';
import { serverClient } from '../../../lib/supabase';
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = serverClient(request, cookies);
  if (sb) await sb.auth.signOut();
  return redirect('/admin/login');
};
