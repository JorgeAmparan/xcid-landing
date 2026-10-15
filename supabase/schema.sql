-- xcid.dev — esquema de contenido
-- Ejecutar en Supabase → SQL Editor. Idempotente.

create extension if not exists "pgcrypto";

-- ───────────────────────── Taxonomía ─────────────────────────
create table if not exists series (
  slug        text primary key,
  nombre      text not null,
  descripcion text,
  orden       int  default 0
);

create table if not exists temas (
  slug   text primary key,
  nombre text not null
);

-- ───────────────────────── Escritos ──────────────────────────
create table if not exists escritos (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  titulo      text not null,
  bajada      text,
  cuerpo_md   text default '',
  serie       text references series(slug),
  tipo        text default 'ensayo',          -- ensayo | comentario | nota
  idioma      text default 'es',              -- es | en
  temas       text[] default '{}',
  fecha       date not null default current_date,
  minutos     int,
  origen_url  text,                           -- p. ej. versión en LinkedIn
  publicado   boolean default false,
  creado_en   timestamptz default now(),
  editado_en  timestamptz default now()
);
create index if not exists escritos_pub_idx on escritos (publicado, fecha desc);

-- ───────────────────────── Plataformas propias ───────────────
create table if not exists plataformas (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nombre      text not null,
  etiqueta    text,                           -- "MOTOR DE INGESTA", "VERTICAL · LABORATORIO"…
  descripcion text,
  stack       text[] default '{}',
  estado      text,                           -- texto libre público
  insignia    boolean default false,          -- destacada en /trabajo
  problema    text, solucion text,            -- solo para la insignia
  url         text,
  orden       int default 0,
  publicado   boolean default true,
  editado_en  timestamptz default now()
);

-- ───────────────────────── Proyectos Lappicero ───────────────
create table if not exists proyectos (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nombre      text not null,
  resumen     text,
  tipo        text default 'Web app',         -- Web app | Sitio web | Landing
  stack       text[] default '{}',
  url         text,
  orden       int default 0,
  publicado   boolean default true,
  editado_en  timestamptz default now()
);

-- ───────────────────────── Página de inicio ──────────────────
create table if not exists ajustes (
  clave text primary key,
  valor jsonb not null default '{}'
);

-- editado_en automático
create or replace function touch_editado() returns trigger language plpgsql as $$
begin new.editado_en = now(); return new; end $$;
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'escritos_touch') then
    create trigger escritos_touch before update on escritos for each row execute function touch_editado();
    create trigger plataformas_touch before update on plataformas for each row execute function touch_editado();
    create trigger proyectos_touch before update on proyectos for each row execute function touch_editado();
  end if;
end $$;

-- ───────────────────────── Seguridad (RLS) ───────────────────
-- Lectura pública solo de lo publicado; escritura solo para los correos admin.
create or replace function es_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (
    string_to_array(coalesce(current_setting('app.admin_emails', true), 'jamparan@lappicerostudio.com'), ',')
  )
$$;

alter table series      enable row level security;
alter table temas       enable row level security;
alter table escritos    enable row level security;
alter table plataformas enable row level security;
alter table proyectos   enable row level security;
alter table ajustes     enable row level security;

drop policy if exists series_read on series;       create policy series_read      on series      for select using (true);
drop policy if exists temas_read on temas;         create policy temas_read       on temas       for select using (true);
drop policy if exists ajustes_read on ajustes;     create policy ajustes_read     on ajustes     for select using (true);
drop policy if exists escritos_read on escritos;   create policy escritos_read    on escritos    for select using (publicado or es_admin());
drop policy if exists plat_read on plataformas;    create policy plat_read        on plataformas for select using (publicado or es_admin());
drop policy if exists proy_read on proyectos;      create policy proy_read        on proyectos   for select using (publicado or es_admin());

drop policy if exists series_admin on series;      create policy series_admin     on series      for all using (es_admin()) with check (es_admin());
drop policy if exists temas_admin on temas;        create policy temas_admin      on temas       for all using (es_admin()) with check (es_admin());
drop policy if exists ajustes_admin on ajustes;    create policy ajustes_admin    on ajustes     for all using (es_admin()) with check (es_admin());
drop policy if exists escritos_admin on escritos;  create policy escritos_admin   on escritos    for all using (es_admin()) with check (es_admin());
drop policy if exists plat_admin on plataformas;   create policy plat_admin       on plataformas for all using (es_admin()) with check (es_admin());
drop policy if exists proy_admin on proyectos;     create policy proy_admin       on proyectos   for all using (es_admin()) with check (es_admin());

-- Imágenes de los escritos (bucket público de lectura, escritura admin)
insert into storage.buckets (id, name, public) values ('imagenes', 'imagenes', true) on conflict (id) do nothing;
drop policy if exists img_read on storage.objects;
create policy img_read  on storage.objects for select using (bucket_id = 'imagenes');
drop policy if exists img_admin on storage.objects;
create policy img_admin on storage.objects for all using (bucket_id = 'imagenes' and es_admin()) with check (bucket_id = 'imagenes' and es_admin());

-- ───────────────────────── Semilla ───────────────────────────
insert into series (slug, nombre, descripcion, orden) values
  ('criterio', 'Criterio', 'Gobernanza de IA, soberanía operativa y arquitectura de sistemas inteligentes.', 1),
  ('roce',     'Roce',     'Lo personal y literario: la vida como movimiento y fricción con el mundo.', 2)
on conflict (slug) do nothing;

insert into temas (slug, nombre) values
  ('gobernanza','gobernanza'),('soberania','soberanía'),('arquitectura','arquitectura'),
  ('organizacion','organización'),('vida','vida'),('familia','familia')
on conflict (slug) do nothing;
