import type { APIRoute } from 'astro';
import { serverClient, ADMIN_EMAILS } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies, url, redirect }) => {
  const sb = serverClient(request, cookies);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  if (!sb) return redirect('/admin/login?e=link');
  let ok = false;
  if (code) ok = !(await sb.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await sb.auth.verifyOtp({ token_hash: tokenHash, type: type as any })).error;
  if (!ok) return redirect('/admin/login?e=link');
  const { data } = await sb.auth.getUser();
  const email = data.user?.email?.toLowerCase() ?? '';
  if (!ADMIN_EMAILS.includes(email)) { await sb.auth.signOut(); return redirect('/admin/login?e=noadmin'); }
  return redirect('/admin');
};
