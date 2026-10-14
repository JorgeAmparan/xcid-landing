import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Las variables se leen en tiempo de ejecución (process.env) para que Railway pueda
// cambiarlas sin reconstruir; se aceptan con o sin prefijo PUBLIC_.
const env = (k: string) => process.env[k] ?? process.env['PUBLIC_' + k] ?? (import.meta.env as any)[k] ?? (import.meta.env as any)['PUBLIC_' + k];

export const SUPABASE_URL = env('SUPABASE_URL') as string | undefined;
export const SUPABASE_ANON_KEY = env('SUPABASE_ANON_KEY') as string | undefined;
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const ADMIN_EMAILS = String(env('ADMIN_EMAILS') ?? 'jamparan@lappicerostudio.com')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

export const SITE_URL = (env('SITE_URL') as string | undefined) ?? 'https://xcid.dev';

/** Cliente de servidor ligado a las cookies de la petición (sesión del usuario). */
export function serverClient(request: Request, cookies: AstroCookies) {
  if (!hasSupabase) return null;
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of list) {
          cookies.set(name, value, { ...options, path: '/' } as any);
        }
      },
    },
  });
}

/** Cliente anónimo para lectura pública (sin sesión). */
export function anonClient() {
  if (!hasSupabase) return null;
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export async function currentAdmin(request: Request, cookies: AstroCookies) {
  const sb = serverClient(request, cookies);
  if (!sb) return { sb: null, user: null, isAdmin: false };
  const { data } = await sb.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return { sb, user: data.user ?? null, isAdmin: Boolean(email && ADMIN_EMAILS.includes(email)) };
}
