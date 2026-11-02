"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, LogOut, Menu, Search, Settings, Shield, User, X, Library } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { NAV_LINKS } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SearchBox } from "../search/SearchBox";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";

type HeaderUser = Pick<Profile, "username" | "display_name" | "avatar_url" | "role"> | null;

export function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setSearch(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch(false);
        setMenu(false);
        setMobile(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md transition-[box-shadow,border-color,padding] duration-500",
          scrolled ? "border-b border-line py-3" : "border-b border-transparent py-5",
        )}
      >
        <div className="container-editorial flex items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <li key={l.href} className="relative">
                  <Link
                    href={l.href}
                    className={cn("py-2 text-[0.84rem] tracking-wide transition-colors", isActive(l.href) ? "text-forest" : "text-ink/75 hover:text-forest")}
                    aria-current={isActive(l.href) ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                  {isActive(l.href) && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-forest" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearch(true)} className="rounded-full p-2.5 text-ink/80 transition-colors hover:bg-ivory hover:text-forest" aria-label="Buscar (Ctrl+K)">
              <Search className="size-[18px]" />
            </button>
            <Link href="/coleccion?tab=favoritos" className="rounded-full p-2.5 text-ink/80 transition-colors hover:bg-ivory hover:text-forest" aria-label="Mis favoritos">
              <Heart className="size-[18px]" />
            </Link>

            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenu((m) => !m)}
                  className="ml-1 rounded-full ring-offset-2 transition hover:ring-2 hover:ring-sage/50"
                  aria-haspopup="menu"
                  aria-expanded={menu}
                  aria-label="Menú de usuario"
                >
                  <Avatar name={user.display_name} src={user.avatar_url} size={34} />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-60 origin-top-right overflow-hidden rounded-xl border border-line bg-white py-2 shadow-[0_24px_60px_-24px_rgba(34,32,29,0.3)]"
                    >
                      <div className="border-b border-line px-4 pt-1 pb-3">
                        <p className="font-serif text-lg leading-tight">{user.display_name}</p>
                        <p className="text-xs text-muted">@{user.username}</p>
                      </div>
                      <MenuLink href={`/perfil/${user.username}`} icon={User}>Mi perfil</MenuLink>
                      <MenuLink href="/coleccion" icon={Library}>Mi colección</MenuLink>
                      <MenuLink href="/ajustes" icon={Settings}>Ajustes y privacidad</MenuLink>
                      {(user.role === "admin" || user.role === "moderator") && (
                        <MenuLink href="/admin" icon={Shield}>Panel de administración</MenuLink>
                      )}
                      <form action={signOut} className="mt-1 border-t border-line pt-1">
                        <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-muted hover:bg-ivory hover:text-ink" role="menuitem">
                          <LogOut className="size-4" /> Cerrar sesión
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href={`/ingresar?next=${encodeURIComponent(pathname)}`} className="btn btn-primary ml-2 hidden !py-2.5 sm:inline-flex">
                Iniciar sesión
              </Link>
            )}

            <button onClick={() => setMobile(true)} className="rounded-full p-2.5 lg:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Buscador superpuesto */}
      <AnimatePresence>
        {search && (
          <motion.div className="fixed inset-0 z-[60] bg-white/97 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container-editorial pt-24 sm:pt-32">
              <button onClick={() => setSearch(false)} className="absolute top-6 right-6 rounded-full p-2 hover:bg-ivory" aria-label="Cerrar buscador">
                <X className="size-6" />
              </button>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl">
                <p className="eyebrow mb-4 text-center">Buscar en Reseñarte</p>
                <SearchBox autoFocus onNavigate={() => setSearch(false)} />
                <p className="mt-4 text-center text-xs text-muted">Probá con un perfume, una marca o una nota como “vainilla” o “bergamota”.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobile && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.nav
              aria-label="Navegación móvil"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 flex w-[min(86vw,22rem)] flex-col bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobile(false)} className="rounded-full p-2 hover:bg-ivory" aria-label="Cerrar menú">
                  <X className="size-5" />
                </button>
              </div>
              <motion.ul
                className="mt-10 flex flex-col"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
              >
                {NAV_LINKS.map((l) => (
                  <motion.li key={l.href} variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}>
                    <Link href={l.href} className={cn("block border-b border-line py-4 font-serif text-3xl", isActive(l.href) ? "text-forest" : "text-ink")}>
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="mt-auto">
                {user ? (
                  <Link href={`/perfil/${user.username}`} className="btn btn-outline w-full">Mi perfil</Link>
                ) : (
                  <Link href={`/ingresar?next=${encodeURIComponent(pathname)}`} className="btn btn-primary w-full">Iniciar sesión / Registrarse</Link>
                )}
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/85 hover:bg-ivory hover:text-forest">
      <Icon className="size-4" /> {children}
    </Link>
  );
}
