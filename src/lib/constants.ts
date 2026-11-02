// Textos de la interfaz centralizados para facilitar una futura internacionalización.

export const SITE = {
  name: "Reseñarte",
  claim: "El arte de descubrir perfumes.",
  description:
    "Descubrí nuevas fragancias, explorá sus notas y compartí tu experiencia con una comunidad que ama los perfumes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/perfumes", label: "Explorar perfumes" },
  { href: "/marcas", label: "Marcas" },
  { href: "/resenas", label: "Reseñas" },
  { href: "/coleccion", label: "Mi colección" },
];

export const NO_INFO = "Sin información disponible";

export const LONGEVITY = ["Muy baja", "Baja", "Moderada", "Alta", "Muy alta"];
export const SILLAGE = ["Íntima", "Moderada", "Notable", "Intensa"];

export const SEASONS: Record<string, string> = {
  primavera: "Primavera",
  verano: "Verano",
  otono: "Otoño",
  invierno: "Invierno",
};
export const DAYTIME: Record<string, string> = { dia: "Día", noche: "Noche", ambos: "Ambos" };
export const OCCASIONS: Record<string, string> = {
  diario: "Diario",
  oficina: "Oficina",
  citas: "Citas",
  eventos: "Eventos",
  especiales: "Ocasiones especiales",
};

export const REBUY: Record<string, string> = {
  si: "Sí, lo volvería a comprar",
  no: "No lo volvería a comprar",
  no_seguro: "No está seguro/a",
};
export const REBUY_SHORT: Record<string, string> = { si: "Sí", no: "No", no_seguro: "No estoy seguro/a" };

export const TRIED_VIA: Record<string, string> = {
  frasco: "Tengo el frasco",
  decant: "Tengo un decant o muestra",
  tienda: "Lo probé en tienda",
  prestado: "Me lo prestaron",
};

export const CONCENTRATIONS = ["EDC", "EDT", "EDP", "Parfum", "Extrait", "Otra"];

export const GENDERS: Record<string, string> = {
  femenino: "Femenino",
  masculino: "Masculino",
  unisex: "Unisex",
};

export const COLLECTION_STATUS: Record<string, string> = {
  tengo: "Los tengo",
  tuve: "Los tuve",
  quiero: "Los quiero",
  probando: "Los estoy probando",
};

export const NOTE_LAYERS = [
  { key: "salida", label: "Notas de salida", hint: "Las primeras notas que se perciben." },
  { key: "corazon", label: "Notas de corazón", hint: "Las notas centrales." },
  { key: "fondo", label: "Notas de fondo", hint: "Las notas que permanecen." },
] as const;

export const SORT_OPTIONS: Record<string, string> = {
  populares: "Más populares",
  valorados: "Mejor valorados",
  resenados: "Más reseñados",
  recientes: "Más recientes",
  nombre: "Nombre (A–Z)",
};

export const REVIEW_LIMITS = { titleMin: 4, titleMax: 120, bodyMin: 80, bodyMax: 4000 };
export const IMAGE_LIMITS = { maxBytes: 5 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp"] };

/** Tono de cada familia para placeholders y tarjetas. */
export const FAMILY_TONES: Record<string, { liquid: string; bg: string }> = {
  floral: { liquid: "#D9B8AE", bg: "#F6EEEA" },
  amaderada: { liquid: "#8C6B4F", bg: "#F1ECE4" },
  "oriental-ambar": { liquid: "#B9824A", bg: "#F5EDE2" },
  citrica: { liquid: "#E2C36B", bg: "#F7F3E6" },
  gourmand: { liquid: "#7A5A45", bg: "#F3ECE6" },
  fresca: { liquid: "#9DB7B0", bg: "#EEF3F1" },
  aromatica: { liquid: "#8A9B7A", bg: "#EFF2EB" },
};
export const DEFAULT_TONE = { liquid: "#8A9B7A", bg: "#F5F3EE" };
