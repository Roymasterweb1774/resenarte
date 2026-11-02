"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { submitVote } from "@/app/actions/community";
import { DAYTIME, LONGEVITY, OCCASIONS, SEASONS, SILLAGE } from "@/lib/constants";
import type { VoteRow, VoteStats } from "@/lib/types";
import { cn, plural } from "@/lib/utils";
import { useToast } from "../ui/Toast";

function Distribution({ title, rows, total }: { title: string; rows: { label: string; count: number }[]; total: number }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-2xl border border-line p-5">
      <h3 className="mb-4 text-xl">{title}</h3>
      <ul className="space-y-2.5">
        {rows.map((r, i) => (
          <li key={r.label} className="grid grid-cols-[110px_1fr_34px] items-center gap-3 text-xs">
            <span className="text-ink/80">{r.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-ivory">
              <motion.span
                className="block h-full rounded-full bg-forest"
                initial={{ width: 0 }}
                whileInView={{ width: `${(r.count / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="text-right text-muted tabular-nums">{total ? `${Math.round((r.count / total) * 100)}%` : "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommunityVotes({
  perfumeId,
  slug,
  stats,
  mine,
  loggedIn,
}: {
  perfumeId: string;
  slug: string;
  stats: VoteStats;
  mine: VoteRow | null;
  loggedIn: boolean;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [vote, setVote] = useState<VoteRow>(mine ?? { longevity: null, sillage: null, seasons: [], daytime: null, occasions: [] });

  const toggleIn = (key: "seasons" | "occasions", v: string) =>
    setVote((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));

  const save = () =>
    start(async () => {
      const res = await submitVote(perfumeId, slug, vote);
      if (res.ok) {
        toast(res.message ?? "Voto guardado");
        setOpen(false);
      } else toast(res.error, "error");
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {stats.total ? `Basado en ${plural(stats.total, "voto real", "votos reales")} de la comunidad.` : "Todavía no hay votos. Los gráficos se completan con votos reales."}
        </p>
        {loggedIn ? (
          <button onClick={() => setOpen((o) => !o)} className="btn btn-outline !py-2" aria-expanded={open}>
            {mine ? "Editar mi voto" : "Votar características"}
          </button>
        ) : (
          <Link href={`/ingresar?next=${encodeURIComponent(`/perfumes/${slug}#comunidad`)}`} className="btn btn-outline !py-2">
            Iniciá sesión para votar
          </Link>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mb-8 space-y-5 rounded-2xl bg-ivory p-5 sm:p-6">
              <ChipGroup label="Duración" options={LONGEVITY.map((l, i) => [String(i + 1), l])} isActive={(v) => vote.longevity === Number(v)} onToggle={(v) => setVote((s) => ({ ...s, longevity: s.longevity === Number(v) ? null : Number(v) }))} />
              <ChipGroup label="Proyección o estela" options={SILLAGE.map((l, i) => [String(i + 1), l])} isActive={(v) => vote.sillage === Number(v)} onToggle={(v) => setVote((s) => ({ ...s, sillage: s.sillage === Number(v) ? null : Number(v) }))} />
              <ChipGroup label="Mejor estación (varias)" options={Object.entries(SEASONS)} isActive={(v) => vote.seasons.includes(v)} onToggle={(v) => toggleIn("seasons", v)} />
              <ChipGroup label="Momento" options={Object.entries(DAYTIME)} isActive={(v) => vote.daytime === v} onToggle={(v) => setVote((s) => ({ ...s, daytime: s.daytime === v ? null : v }))} />
              <ChipGroup label="Ocasión (varias)" options={Object.entries(OCCASIONS)} isActive={(v) => vote.occasions.includes(v)} onToggle={(v) => toggleIn("occasions", v)} />
              <button onClick={save} disabled={pending} className="btn btn-primary">
                {pending && <Loader2 className="size-4 animate-spin" />} Guardar mi voto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Distribution title="Duración" total={stats.total} rows={LONGEVITY.map((label, i) => ({ label, count: stats.longevity[i] }))} />
        <Distribution title="Proyección" total={stats.total} rows={SILLAGE.map((label, i) => ({ label, count: stats.sillage[i] }))} />
        <Distribution title="Estación" total={stats.total} rows={Object.entries(SEASONS).map(([k, label]) => ({ label, count: stats.seasons[k] ?? 0 }))} />
        <Distribution title="Momento" total={stats.total} rows={Object.entries(DAYTIME).map(([k, label]) => ({ label, count: stats.daytime[k] ?? 0 }))} />
        <Distribution title="Ocasión" total={stats.total} rows={Object.entries(OCCASIONS).map(([k, label]) => ({ label, count: stats.occasions[k] ?? 0 }))} />
      </div>
    </div>
  );
}

function ChipGroup({
  label,
  options,
  isActive,
  onToggle,
}: {
  label: string;
  options: [string, string][];
  isActive: (v: string) => boolean;
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={isActive(v)}
            onClick={() => onToggle(v)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300",
              isActive(v) ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest/50",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
