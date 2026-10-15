-- Solicitudes de contacto / piloto enviadas desde /contacto. Ejecutar en SQL Editor.
create table if not exists solicitudes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  empresa    text,
  contacto   text not null,          -- correo o teléfono
  motivo     text not null,          -- piloto | consultoria | desarrollo | otro
  mensaje    text,
  canal      text,                   -- whatsapp | correo | web
  atendida   boolean default false,
  creado_en  timestamptz default now()
);
alter table solicitudes enable row level security;
drop policy if exists solicitudes_insert on solicitudes;
create policy solicitudes_insert on solicitudes for insert with check (true);
drop policy if exists solicitudes_admin on solicitudes;
create policy solicitudes_admin on solicitudes for all using (es_admin()) with check (es_admin());
