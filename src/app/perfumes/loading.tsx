import { PerfumeCardSkeleton } from "@/components/perfume/PerfumeCard";

export default function Loading() {
  return (
    <div className="container-editorial pt-8" aria-busy="true" aria-label="Cargando catálogo">
      <div className="mx-auto flex max-w-3xl flex-col items-center pb-14">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-4 h-14 w-80" />
        <div className="skeleton mt-8 h-12 w-full max-w-xl rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <PerfumeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
