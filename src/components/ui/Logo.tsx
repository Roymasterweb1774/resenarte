import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Reseñarte, ir al inicio"
      className={cn(
        "font-serif text-[1.7rem] leading-none font-semibold tracking-tight transition-opacity hover:opacity-80",
        light ? "text-white" : "text-forest",
        className,
      )}
    >
      reseñarte<span className={light ? "text-sage-light" : "text-chocolate"}>.</span>
    </Link>
  );
}
