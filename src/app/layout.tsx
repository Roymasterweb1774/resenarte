import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.claim}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "es_AR", type: "website" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentUser();
  const p = current?.profile;
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-white">
          Saltar al contenido
        </a>
        <Providers>
          <Header user={p ? { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url, role: p.role } : null} />
          {!isSupabaseConfigured() && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-chocolate/20 bg-[#FBF8F2]/95 px-4 py-2 text-center text-xs text-chocolate backdrop-blur">
              Modo demostración: catálogo inicial sin base de datos. Conectá Supabase para activar cuentas, reseñas y colecciones (ver README).
            </div>
          )}
          <main id="contenido" className="pt-24">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
