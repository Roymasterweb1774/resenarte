"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { BottleArt } from "../perfume/BottleArt";
import { SearchBox } from "../search/SearchBox";

const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE = ["Cada", "perfume", "tiene", "una", "historia."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const ySide = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="container-editorial grid items-center gap-14 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-28">
        <div>
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            El arte de descubrir perfumes
          </motion.p>

          <h1 className="mt-6 text-[3.1rem] leading-[0.98] sm:text-7xl lg:text-[5.6rem]">
            {TITLE.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pr-[0.22em] pb-[0.08em] align-bottom">
                <motion.span
                  className={`inline-block ${word === "historia." ? "text-forest italic" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.08 }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
          >
            Descubrí nuevas fragancias, explorá sus notas y compartí tu experiencia con una comunidad que ama los perfumes tanto como vos.
          </motion.p>

          <motion.div
            className="mt-10 max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
          >
            <SearchBox />
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link href="/perfumes" className="btn btn-primary group">
                Explorar perfumes
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/marcas" className="link-underline text-sm text-chocolate">
                o recorré las marcas
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Composición editorial */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px]" aria-hidden>
          <motion.div
            style={{ y: yBack }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
            className="grain absolute inset-x-[8%] top-0 bottom-[6%] overflow-hidden rounded-t-full bg-ivory"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ivory-deep/70 to-transparent" />
          </motion.div>

          <motion.div
            className="absolute inset-x-[14%] top-[6%] aspect-square rounded-full border border-sage/40"
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
          />

          <motion.div style={{ y: ySide }} className="absolute bottom-[10%] left-0 w-[34%]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ opacity: { duration: 1, delay: 0.7 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            >
              <BottleArt seed="hero-left" family="aromatica" brand="Salvia" variant={3} className="w-full drop-shadow-sm" />
            </motion.div>
          </motion.div>

          <motion.div style={{ y: yFront }} className="absolute bottom-[8%] left-1/2 w-[48%] -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: [0, -14, 0] }}
              transition={{ opacity: { duration: 1.1, delay: 0.5 }, y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
            >
              <BottleArt seed="hero-main" family="oriental-ambar" brand="Reseñarte" variant={0} className="w-full" />
            </motion.div>
          </motion.div>

          <motion.div style={{ y: ySide }} className="absolute right-0 bottom-[16%] w-[30%]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ opacity: { duration: 1, delay: 0.9 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 } }}
            >
              <BottleArt seed="hero-right" family="floral" brand="Bruma" variant={1} className="w-full" />
            </motion.div>
          </motion.div>

          {/* Sello circular giratorio */}
          <motion.div
            className="absolute top-[4%] right-[2%] size-28 sm:size-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ opacity: { duration: 1, delay: 1 }, rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
          >
            <svg viewBox="0 0 120 120" className="size-full">
              <defs>
                <path id="hero-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#fff" stroke="#E4E0D8" />
              <text fontSize="10.5" letterSpacing="3.2" fill="#594537" fontFamily="Inter, sans-serif">
                <textPath href="#hero-circle">EL ARTE DE DESCUBRIR · PERFUMES · </textPath>
              </text>
              <text x="60" y="68" textAnchor="middle" fontFamily="Georgia, serif" fontSize="24" fill="#344B38" fontStyle="italic">r.</text>
            </svg>
          </motion.div>

          <motion.p
            className="absolute bottom-0 left-[8%] font-serif text-sm text-chocolate italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            n.º 01 — Colección editorial
          </motion.p>
        </div>
      </div>
    </section>
  );
}
