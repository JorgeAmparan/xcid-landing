/**
 * Capa de datos. Lee de Supabase cuando está configurado; si no, del seed local,
 * para que el sitio se pueda desplegar y revisar antes de conectar la base.
 */
import seed from '../data/seed.json';
import { anonClient, hasSupabase } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Escrito = {
  id?: string; slug: string; titulo: string; bajada?: string | null; cuerpo_md?: string | null;
  serie: string; tipo: string; idioma: string; temas: string[]; fecha: string; minutos?: number | null;
  origen_url?: string | null; publicado: boolean; editado_en?: string;
};
export type Plataforma = {
  id?: string; slug: string; nombre: string; etiqueta?: string | null; descripcion?: string | null;
  stack: string[]; estado?: string | null; insignia: boolean; problema?: string | null; solucion?: string | null;
  url?: string | null; orden: number; publicado: boolean;
};
export type Proyecto = {
  id?: string; slug: string; nombre: string; resumen?: string | null; tipo: string; stack: string[];
  url?: string | null; orden: number; publicado: boolean;
};
export type Serie = { slug: string; nombre: string; descripcion?: string | null; orden: number };
export type Tema = { slug: string; nombre: string };

const S = seed as any;

export function readingMinutes(md: string | null | undefined, fallback?: number | null) {
  if (fallback) return fallback;
  const words = (md ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getSeries(sb?: SupabaseClient | null): Promise<Serie[]> {
  const c = sb ?? anonClient();
  if (!c) return S.series;
  const { data } = await c.from('series').select('*').order('orden');
  return data?.length ? data : S.series;
}

export async function getTemas(sb?: SupabaseClient | null): Promise<Tema[]> {
  const c = sb ?? anonClient();
  if (!c) return S.temas;
  const { data } = await c.from('temas').select('*').order('nombre');
  return data?.length ? data : S.temas;
}

export async function getEscritos(opts: { all?: boolean; sb?: SupabaseClient | null; _seed?: boolean } = {}): Promise<Escrito[]> {
  const c = opts._seed ? null : opts.sb ?? anonClient();
  if (!c) {
    const list: Escrito[] = S.escritos;
    return (opts.all ? list : list.filter((e) => e.publicado)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  let q = c.from('escritos').select('*').order('fecha', { ascending: false });
  if (!opts.all) q = q.eq('publicado', true);
  const { data, error } = await q;
  if (error) return getEscritos({ ...opts, sb: null, _seed: true } as any);
  return data ?? [];
}

export async function getEscrito(slug: string, opts: { sb?: SupabaseClient | null; all?: boolean } = {}): Promise<Escrito | null> {
  const c = opts.sb ?? anonClient();
  if (!c) {
    const e = (S.escritos as Escrito[]).find((x) => x.slug === slug);
    return e && (e.publicado || opts.all) ? e : null;
  }
  let q = c.from('escritos').select('*').eq('slug', slug);
  if (!opts.all) q = q.eq('publicado', true);
  const { data, error } = await q.maybeSingle();
  if (error) { const e = (S.escritos as Escrito[]).find((x) => x.slug === slug); return e && (e.publicado || opts.all) ? e : null; }
  return data ?? null;
}

export async function getPlataformas(opts: { all?: boolean; sb?: SupabaseClient | null; _seed?: boolean } = {}): Promise<Plataforma[]> {
  const c = opts._seed ? null : opts.sb ?? anonClient();
  if (!c) {
    const list: Plataforma[] = S.plataformas;
    return (opts.all ? list : list.filter((p) => p.publicado)).sort((a, b) => a.orden - b.orden);
  }
  let q = c.from('plataformas').select('*').order('orden');
  if (!opts.all) q = q.eq('publicado', true);
  const { data, error } = await q;
  if (error) return getPlataformas({ ...opts, sb: null, _seed: true });
  return data ?? [];
}

export async function getProyectos(opts: { all?: boolean; sb?: SupabaseClient | null; _seed?: boolean } = {}): Promise<Proyecto[]> {
  const c = opts._seed ? null : opts.sb ?? anonClient();
  if (!c) {
    const list: Proyecto[] = S.proyectos;
    return (opts.all ? list : list.filter((p) => p.publicado)).sort((a, b) => a.orden - b.orden);
  }
  let q = c.from('proyectos').select('*').order('orden');
  if (!opts.all) q = q.eq('publicado', true);
  const { data, error } = await q;
  if (error) return getProyectos({ ...opts, sb: null, _seed: true });
  return data ?? [];
}

export async function getAjuste<T = any>(clave: string, sb?: SupabaseClient | null): Promise<T> {
  const c = sb ?? anonClient();
  if (!c) return S.ajustes[clave] as T;
  const { data } = await c.from('ajustes').select('valor').eq('clave', clave).maybeSingle();
  return (data?.valor as T) ?? (S.ajustes[clave] as T);
}

export const usingSeed = !hasSupabase;

export function fmtFecha(iso: string, lang = 'es') {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}
