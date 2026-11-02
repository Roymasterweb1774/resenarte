"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Citrus, Cookie, Droplets, Flame, Flower2, Leaf, Trees, Sparkles } from "lucide-react";
import Link from "next/link";
import { FAMILY_TONES } from "@/lib/constants";
import type { Family } from "@/lib/types";
import { fadeUp } from "../motion/Reveal";

const ICONS: Record<string, React.ElementType> = {
  floral: Flower2,
  amaderada: Trees,
  "oriental-ambar": Flame,
  citrica: Citrus,
  gourmand: Cookie,
  fresca: Droplets,
  aromatica: Leaf,
};

export function FamilyGrid({ families, counts }: { families: Family[]; counts: Record<string, number> }) {
  return (
    <motion.ul
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {families.map((f, i) => {
        const Icon = ICONS[f.slug] ?? Sparkles;
        const tone = FAMILY_TONES[f.slug];
        return (
          <motion.li key={f.id} variants={fadeUp} className={i === 0 ? "col-span-2 md:row-span-2" : ""}>
            <Link
              href={`/perfumes?familia=${f.slug}`}
              className="group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-line p-5 transition-colors duration-500 hover:border-forest/40 sm:p-6"
              style={{ backgroundColor: tone?.bg ?? "#F5F3EE" }}
            >
              <motion.span
                className="absolute -right-10 -bottom-10 size-40 rounded-full opacity-40 transition-transform duration-700 group-hover:scale-150"
                style={{ backgroundColor: tone?.liquid ?? "#8A9B7A" }}
              />
              <div className="relative flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-white/80 text-forest backdrop-blur">
                  <Icon className="size-[18px]" strokeWidth={1.5} />
                </span>
                <ArrowUpRight className="size-5 -translate-x-1 translate-y-1 text-forest opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>
              <div className="relative mt-8">
                <h3 className={i === 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-[1.7rem]"}>{f.name}</h3>
                {i === 0 && f.description && <p className="mt-3 max-w-xs text-sm text-ink/70">{f.description}</p>}
                <p className="mt-1 text-xs text-chocolate">{counts[f.slug] ?? 0} perfumes</p>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
