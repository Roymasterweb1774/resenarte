import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/ajustes", "/coleccion", "/ingresar", "/api/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
