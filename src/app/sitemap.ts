import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllPerfumes, getBrands } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [perfumes, brands] = await Promise.all([getAllPerfumes(), getBrands()]);
  const base = SITE.url;
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/perfumes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/marcas`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/resenas`, changeFrequency: "daily", priority: 0.7 },
    ...perfumes.map((p) => ({ url: `${base}/perfumes/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...brands.map((b) => ({ url: `${base}/marcas/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
