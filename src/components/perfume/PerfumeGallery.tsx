"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { Perfume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PerfumeVisual, perfumeTone } from "./PerfumeVisual";

export function PerfumeGallery({ perfume }: { perfume: Perfume }) {
  const images = [perfume.image_url, ...perfume.gallery].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const tone = perfumeTone(perfume.family?.slug);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="grain relative aspect-[4/5] overflow-hidden rounded-3xl border border-line"
        style={{ backgroundColor: tone.bg }}
      >
        {images.length ? (
          <AnimatePresence mode="wait">
            <motion.div key={images[active]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Image src={images[active]} alt={`${perfume.name} de ${perfume.brand.name}`} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-[8%]" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div className="absolute inset-0" animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
            <PerfumeVisual perfume={perfume} className="h-full w-full !bg-transparent" />
          </motion.div>
        )}
      </motion.div>
      {perfume.image_credit && <p className="mt-2 text-xs text-muted">Imagen: {perfume.image_credit}</p>}
      {!images.length && <p className="mt-2 text-xs text-muted">Ilustración — todavía no hay una fotografía con derechos de uso.</p>}

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-pressed={i === active}
              className={cn("relative size-20 overflow-hidden rounded-xl border-2 transition-colors", i === active ? "border-forest" : "border-transparent hover:border-line")}
              style={{ backgroundColor: tone.bg }}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
