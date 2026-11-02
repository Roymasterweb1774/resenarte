import { perfumeScore } from "./search";
import type { Perfume } from "./types";
import { normalize } from "./utils";

export const PAGE_SIZE = 12;

export interface CatalogParams {
  q?: string;
  marca?: string;
  familia?: string;
  nota?: string;
  acordes?: string;
  genero?: string;
  conc?: string;
  min?: string;
  desde?: string;
  hasta?: string;
  orden?: string;
  pagina?: string;
}

const popularity = (p: Perfume) => p.review_count * 3 + p.favorites_count * 2 + (p.rating_avg ?? 0);

/**
 * Filtra y ordena el catálogo. Pensado para un catálogo de tamaño MVP;
 * con miles de perfumes conviene mover estos filtros a SQL (ver README).
 */
export function filterCatalog(all: Perfume[], params: CatalogParams) {
  let list = all;
  const q = params.q?.trim() ?? "";
  let fuzzyOnly = false;

  if (params.marca) list = list.filter((p) => p.brand.slug === params.marca);
  if (params.familia) list = list.filter((p) => p.family?.slug === params.familia);
  if (params.nota) list = list.filter((p) => p.notes.some((n) => n.note.slug === params.nota));
  if (params.genero) list = list.filter((p) => p.gender === params.genero);
  if (params.conc) list = list.filter((p) => p.concentration === params.conc);
  const min = Number(params.min);
  if (min > 0) list = list.filter((p) => (p.rating_avg ?? 0) >= min && p.review_count > 0);
  const desde = Number(params.desde);
  const hasta = Number(params.hasta);
  if (desde) list = list.filter((p) => p.release_year != null && p.release_year >= desde);
  if (hasta) list = list.filter((p) => p.release_year != null && p.release_year <= hasta);

  let scores = new Map<string, number>();
  if (q) {
    scores = new Map(list.map((p) => [p.id, perfumeScore(q, p)]));
    list = list.filter((p) => (scores.get(p.id) ?? 0) > 0);
    const nq = normalize(q);
    fuzzyOnly =
      list.length > 0 &&
      !list.some((p) => normalize(`${p.brand.name} ${p.name} ${p.notes.map((n) => n.note.name).join(" ")}`).includes(nq));
  }

  const orden = params.orden ?? (q ? "relevancia" : "populares");
  const sorted = [...list].sort((a, b) => {
    switch (orden) {
      case "relevancia":
        return (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
      case "valorados":
        return (b.rating_avg ?? -1) - (a.rating_avg ?? -1) || b.review_count - a.review_count;
      case "resenados":
        return b.review_count - a.review_count;
      case "recientes":
        return b.created_at.localeCompare(a.created_at);
      case "nombre":
        return a.name.localeCompare(b.name, "es");
      default:
        return popularity(b) - popularity(a) || a.name.localeCompare(b.name, "es");
    }
  });

  const page = Math.max(1, Number(params.pagina) || 1);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  return {
    total: sorted.length,
    page: Math.min(page, pages),
    pages,
    results: sorted.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE),
    fuzzyOnly,
    orden,
  };
}
