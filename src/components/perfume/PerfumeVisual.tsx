import Image from "next/image";
import { DEFAULT_TONE, FAMILY_TONES } from "@/lib/constants";
import type { Perfume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BottleArt } from "./BottleArt";

type VisualPerfume = Pick<Perfume, "slug" | "name" | "image_url"> & {
  brand: { name: string };
  family: { slug: string } | null;
};

export function perfumeTone(familySlug?: string | null) {
  return (familySlug && FAMILY_TONES[familySlug]) || DEFAULT_TONE;
}

export function PerfumeVisual({
  perfume,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: {
  perfume: VisualPerfume;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const tone = perfumeTone(perfume.family?.slug);
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: tone.bg }}>
      {perfume.image_url ? (
        <Image
          src={perfume.image_url}
          alt={`${perfume.name} de ${perfume.brand.name}`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-contain p-[10%]", imgClassName)}
        />
      ) : (
        <BottleArt
          seed={perfume.slug}
          family={perfume.family?.slug}
          brand={perfume.brand.name}
          className={cn("absolute inset-0 m-auto h-[78%] w-[78%]", imgClassName)}
        />
      )}
    </div>
  );
}
