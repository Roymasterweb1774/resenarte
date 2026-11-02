export default function Loading() {
  return (
    <div className="container-editorial pt-4" aria-busy="true" aria-label="Cargando perfume">
      <div className="skeleton mb-8 h-3 w-48" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="skeleton aspect-[4/5] !rounded-3xl" />
        <div className="lg:pt-6">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton mt-5 h-16 w-3/4" />
          <div className="skeleton mt-8 h-24 w-full" />
          <div className="skeleton mt-8 h-32 w-full" />
          <div className="mt-10 flex gap-3">
            <div className="skeleton h-11 w-40" />
            <div className="skeleton h-11 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
