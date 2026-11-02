import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";

// Textos base. Revisalos con asesoramiento legal antes de lanzar el sitio.
const PAGES: Record<string, { title: string; body: string[] }> = {
  privacidad: {
    title: "Política de privacidad",
    body: [
      "Reseñarte guarda los datos necesarios para que tu cuenta funcione: email, nombre público, avatar, biografía y el contenido que publicás (reseñas, votos, favoritos y colección).",
      "Tus favoritos y tu colección pueden ser públicos o privados: lo elegís desde Ajustes. Tus reseñas publicadas son públicas.",
      "No vendemos tus datos. Podés editar tu perfil o eliminar tu cuenta y su contenido en cualquier momento desde Ajustes.",
      "La autenticación y el almacenamiento de datos se realizan mediante Supabase.",
    ],
  },
  terminos: {
    title: "Términos de uso",
    body: [
      "Reseñarte es una plataforma de descubrimiento y opinión sobre perfumes. No vendemos productos.",
      "Las reseñas expresan la opinión personal de quien las escribe. Al publicar declarás que tu reseña refleja tu experiencia real y que las imágenes que subís son propias.",
      "Podemos ocultar contenido que incumpla las normas de la comunidad.",
    ],
  },
  normas: {
    title: "Normas de la comunidad",
    body: [
      "Escribí sobre tu experiencia real con el perfume. Nada de reseñas pagas o ficticias.",
      "Respetá a las demás personas: sin insultos, acoso ni discriminación.",
      "Subí solo fotografías propias. No compartas datos personales de terceros.",
      "Si ves contenido que no cumple estas normas, usá el botón Reportar.",
    ],
  },
  contacto: {
    title: "Contacto",
    body: [
      "¿Querés sugerir un perfume, corregir un dato o reportar un problema? Escribinos.",
      "Configurá aquí el email de contacto del proyecto antes de publicar el sitio.",
    ],
  },
};

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = PAGES[(await params).page];
  return { title: p?.title ?? "Página no encontrada" };
}

export default async function LegalPage({ params }: Props) {
  const p = PAGES[(await params).page];
  if (!p) notFound();
  return (
    <Reveal className="container-editorial max-w-3xl pt-10">
      <p className="eyebrow">Reseñarte</p>
      <h1 className="mt-3 mb-10 text-5xl sm:text-6xl">{p.title}</h1>
      <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink/80">
        {p.body.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
    </Reveal>
  );
}
