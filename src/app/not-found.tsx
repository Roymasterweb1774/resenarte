import Link from "next/link";
import { BottleArt } from "@/components/perfume/BottleArt";

export default function NotFound() {
  return (
    <div className="container-editorial flex flex-col items-center pt-16 text-center">
      <BottleArt seed="404" family="fresca" variant={2} showLabel={false} className="h-48 opacity-80" />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        Esta página se <em className="text-forest">evaporó</em>.
      </h1>
      <p className="mt-4 max-w-md text-muted">No encontramos lo que buscabas. Quizás el perfume cambió de nombre o el enlace no es correcto.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/perfumes" className="btn btn-primary">Explorar perfumes</Link>
        <Link href="/" className="btn btn-outline">Volver al inicio</Link>
      </div>
    </div>
  );
}
