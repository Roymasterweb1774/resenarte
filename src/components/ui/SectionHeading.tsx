import Link from "next/link";
import { Reveal } from "../motion/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  text,
  href,
  linkLabel = "Ver todo",
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
        {text && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{text}</p>}
      </div>
      {href && (
        <Link href={href} className="link-underline shrink-0 text-sm text-forest">
          {linkLabel} →
        </Link>
      )}
    </Reveal>
  );
}
