"use client";

import { motion } from "framer-motion";
import { NO_INFO } from "@/lib/constants";
import type { PerfumeAccord } from "@/lib/types";

/** Acordes registrados para el perfume, ordenados por dominancia. */
export function AccordBars({ accords }: { accords: PerfumeAccord[] }) {
  if (!accords.length) return <p className="text-sm text-muted">{NO_INFO}</p>;
  return (
    <ul className="space-y-2.5">
      {accords.map(({ accord, intensity }, i) => (
        <li key={accord.id} className="relative h-10 overflow-hidden rounded-lg bg-ivory">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg"
            style={{ backgroundColor: accord.color ?? "#8A9B7A" }}
            initial={{ width: 0 }}
            whileInView={{ width: `${intensity}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
          />
          <span className="relative z-10 flex h-full items-center px-4 text-sm font-medium text-ink mix-blend-normal">
            <span className="rounded bg-white/70 px-1.5 py-0.5 backdrop-blur-sm">{accord.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
