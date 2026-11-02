import { Mail } from "lucide-react";

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Logo } from "../ui/Logo";

const COLUMNS = [
  {
    title: "Descubrir",
    links: [
      { href: "/perfumes", label: "Explorar perfumes" },
      { href: "/marcas", label: "Marcas" },
      { href: "/resenas", label: "Reseñas" },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { href: "/ingresar?modo=registro", label: "Crear cuenta" },
      { href: "/coleccion", label: "Mi colección" },
      { href: "/legal/normas", label: "Normas de la comunidad" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/terminos", label: "Términos de uso" },
      { href: "/legal/contacto", label: "Contacto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-line bg-ivory">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs font-serif text-xl leading-snug text-chocolate italic">{SITE.claim}</p>
          <div className="mt-6 flex gap-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-line bg-white p-2.5 text-forest transition hover:border-forest">
              <Instagram className="size-4" />
            </a>
            <Link href="/legal/contacto" aria-label="Contacto" className="rounded-full border border-line bg-white p-2.5 text-forest transition hover:border-forest">
              <Mail className="size-4" />
            </Link>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow mb-4">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-ink/80 hover:text-forest">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-editorial flex flex-col justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Reseñarte. Las reseñas reflejan opiniones de usuarios.</p>
          <p>No vendemos perfumes. Somos una comunidad.</p>
        </div>
      </div>
    </footer>
  );
}
