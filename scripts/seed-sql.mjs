// Genera supabase/seed.sql a partir de src/data/seed.json (contenido inicial).
import { readFileSync, writeFileSync } from 'node:fs';
const s = JSON.parse(readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'));
const q = (v) => v == null ? 'null' : typeof v === 'boolean' ? String(v) : typeof v === 'number' ? String(v)
  : Array.isArray(v) ? `array[${v.map(q).join(',')}]::text[]` : `'${String(v).replace(/'/g, "''")}'`;
let out = '-- Generado por scripts/seed-sql.mjs — contenido inicial de xcid.dev\n\n';
for (const e of s.escritos) out += `insert into escritos (slug,titulo,bajada,cuerpo_md,serie,tipo,idioma,temas,fecha,minutos,origen_url,publicado) values (${[e.slug,e.titulo,e.bajada,e.cuerpo_md,e.serie,e.tipo,e.idioma,e.temas,e.fecha,e.minutos,e.origen_url,e.publicado].map(q).join(',')}) on conflict (slug) do nothing;\n`;
out += '\n';
for (const p of s.plataformas) out += `insert into plataformas (slug,nombre,etiqueta,descripcion,stack,estado,insignia,problema,solucion,url,orden,publicado) values (${[p.slug,p.nombre,p.etiqueta,p.descripcion,p.stack,p.estado,p.insignia,p.problema,p.solucion,p.url,p.orden,p.publicado].map(q).join(',')}) on conflict (slug) do nothing;\n`;
out += '\n';
for (const p of s.proyectos) out += `insert into proyectos (slug,nombre,resumen,tipo,stack,url,orden,publicado) values (${[p.slug,p.nombre,p.resumen,p.tipo,p.stack,p.url,p.orden,p.publicado].map(q).join(',')}) on conflict (slug) do nothing;\n`;
out += `\ninsert into ajustes (clave,valor) values ('inicio', ${q(JSON.stringify(s.ajustes.inicio))}::jsonb) on conflict (clave) do nothing;\n`;
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out);
console.log('supabase/seed.sql escrito');
