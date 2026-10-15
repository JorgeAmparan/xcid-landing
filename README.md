# xcid.dev

Sitio de XCID — CoInteligencia Profesional: producto (XCID FACT), portafolio (plataformas propias y proyectos de Lappicero Studio) y blog de ensayos (/escritos), con panel de publicación en /admin.

- **Astro 5** con render en servidor (adaptador Node) — una sola app, un solo servicio en Railway.
- **Supabase** — base de datos del contenido, login por enlace mágico y almacenamiento de imágenes.
- Sin Supabase configurado, el sitio público sirve el contenido de `src/data/seed.json` y `/admin` muestra un aviso.

## Estructura

```
src/pages/            index, fact, trabajo, escritos/, escritos/[slug], verify, 404
src/pages/admin/      panel: escritos, plataformas, proyectos, series, temas, inicio
src/pages/api/        auth (callback, logout), preview (Markdown), upload (imágenes)
src/lib/content.ts    capa de datos (Supabase → seed)
src/lib/supabase.ts   clientes y verificación de admin
src/middleware.ts     protege /admin
src/styles/global.css sistema visual
supabase/schema.sql   tablas, RLS, bucket de imágenes
supabase/seed.sql     contenido inicial (se genera con scripts/seed-sql.mjs)
legacy/               la landing anterior (un solo index.html), por referencia
```

## Puesta en marcha

1. **Supabase**: crea un proyecto (o usa uno existente) y en *SQL Editor* ejecuta `supabase/schema.sql` y luego `supabase/seed.sql`.
2. **Auth**: en *Authentication → URL Configuration* pon `https://xcid.dev` como Site URL y agrega `https://xcid.dev/api/auth/callback` a *Redirect URLs*. El login es por correo (enlace mágico); solo los correos de `ADMIN_EMAILS` entran.
3. **Variables** en el servicio de Railway (`xcid-landing`):

   | Variable | Valor |
   |---|---|
   | `SUPABASE_URL` | Project settings → API → Project URL |
   | `SUPABASE_ANON_KEY` | Project settings → API → anon public |
   | `ADMIN_EMAILS` | `jamparan@lappicerostudio.com` (varios: separados por coma) |
   | `SITE_URL` | `https://xcid.dev` |

4. **Deploy**: Railway construye con el `Dockerfile` al hacer push a `main`. El puerto es `8080`, igual que antes.

## Publicar un ensayo

`/admin` → *Escritos* → *+ Nuevo escrito*. Título, bajada y cuerpo en Markdown (vista previa integrada, imágenes con *Insertar imagen…*). En el panel lateral: serie (Criterio / Roce), tipo, idioma, temas (se crean solos al escribirlos), fecha y URL. *Guardar* deja borrador; *Publicar* lo hace visible al instante. Un admin con sesión puede ver borradores en su URL pública.

## Desarrollo local

```
npm install
cp .env.example .env   # opcional; sin él se usa el seed
npm run dev
```
