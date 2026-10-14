import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/** Markdown → HTML. El contenido lo escribe solo el admin; se escapa HTML crudo por seguridad básica. */
export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return '';
  const safe = md.replace(/<\s*(script|iframe|object|embed)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  return marked.parse(safe) as string;
}

export function slugify(s: string) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
