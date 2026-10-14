import { defineMiddleware } from 'astro:middleware';
import { currentAdmin, hasSupabase } from './lib/supabase';

const NOT_CONFIGURED = `<!doctype html><meta charset="utf-8"><title>Panel no configurado</title>
<body style="font-family:system-ui;padding:40px;max-width:640px;line-height:1.5"><h1>Panel no configurado</h1>
<p>Faltan <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> en las variables del servicio.
Mientras tanto el sitio público sirve el contenido de <code>src/data/seed.json</code>.</p><p><a href="/">← Volver al sitio</a></p></body>`;

export const onRequest = defineMiddleware(async (ctx, next) => {
  const p = ctx.url.pathname;
  const protectedPath = p.startsWith('/admin') && p !== '/admin/login';
  if (protectedPath) {
    if (!hasSupabase) return new Response(NOT_CONFIGURED, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    const { user, isAdmin } = await currentAdmin(ctx.request, ctx.cookies);
    if (!isAdmin) return ctx.redirect('/admin/login' + (user ? '?e=noadmin' : ''));
    ctx.locals.adminUser = user;
  }
  return next();
});
