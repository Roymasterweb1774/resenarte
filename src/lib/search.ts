import type { Perfume } from "./types";
import { normalize } from "./utils";

/** Distancia de Levenshtein con corte temprano. */
export function levenshtein(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

const tolerance = (len: number) => (len <= 3 ? 0 : len <= 6 ? 1 : 2);

/**
 * Puntúa qué tan bien un texto coincide con la consulta.
 * 0 = sin coincidencia. Tolera errores ortográficos simples por palabra.
 */
export function matchScore(query: string, text: string): number {
  const q = normalize(query);
  const t = normalize(text);
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;

  const words = t.split(/[^a-z0-9]+/).filter(Boolean);
  const qWords = q.split(/\s+/).filter(Boolean);
  let total = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const w of words) {
      if (w.startsWith(qw)) best = Math.max(best, 40);
      else {
        const tol = tolerance(qw.length);
        if (tol === 0) continue;
        const cmp = w.length > qw.length + 1 ? w.slice(0, qw.length) : w;
        const d = levenshtein(qw, cmp, tol);
        if (d <= tol) best = Math.max(best, 30 - d * 8);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  return total / qWords.length;
}

export function perfumeScore(query: string, p: Perfume): number {
  const fields = [
    matchScore(query, p.name) * 1.2,
    matchScore(query, p.brand.name),
    matchScore(query, `${p.brand.name} ${p.name}`),
    ...p.notes.map((n) => matchScore(query, n.note.name) * 0.6),
    ...p.accords.map((a) => matchScore(query, a.accord.name) * 0.5),
    p.family ? matchScore(query, p.family.name) * 0.5 : 0,
  ];
  return Math.max(...fields);
}

export interface Suggestion {
  type: "perfume" | "marca" | "nota";
  label: string;
  sub: string;
  href: string;
}

export function buildSuggestions(query: string, perfumes: Perfume[], limit = 8): Suggestion[] {
  if (normalize(query).length < 2) return [];
  const out: (Suggestion & { score: number })[] = [];

  for (const p of perfumes) {
    const s = Math.max(matchScore(query, p.name) * 1.2, matchScore(query, `${p.brand.name} ${p.name}`));
    if (s > 0) out.push({ type: "perfume", label: p.name, sub: p.brand.name, href: `/perfumes/${p.slug}`, score: s });
  }

  const brands = new Map(perfumes.map((p) => [p.brand.slug, p.brand]));
  for (const b of brands.values()) {
    const s = matchScore(query, b.name);
    if (s > 0) out.push({ type: "marca", label: b.name, sub: "Marca", href: `/marcas/${b.slug}`, score: s * 1.1 });
  }

  const notes = new Map(perfumes.flatMap((p) => p.notes.map((n) => [n.note.slug, n.note] as const)));
  for (const n of notes.values()) {
    const s = matchScore(query, n.name);
    if (s > 0) out.push({ type: "nota", label: n.name, sub: "Nota olfativa", href: `/perfumes?nota=${n.slug}`, score: s * 0.9 });
  }

  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...s }) => s);
}
