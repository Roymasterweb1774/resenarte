import { DEFAULT_TONE, FAMILY_TONES } from "@/lib/constants";
import { initials } from "@/lib/utils";

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

type Shape = { bodyPath: string; neck: [number, number, number, number]; cap: React.ReactNode; label: [number, number]; liquidTop: number };

const SHAPES: Shape[] = [
  {
    bodyPath: "M70 82 h60 a10 10 0 0 1 10 10 v136 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 v-136 a10 10 0 0 1 10 -10z",
    neck: [89, 64, 22, 20],
    cap: <rect x="80" y="22" width="40" height="44" rx="4" />,
    label: [100, 168],
    liquidTop: 112,
  },
  {
    bodyPath: "M100 88 a72 72 0 1 1 -0.1 0z",
    neck: [89, 72, 22, 18],
    cap: <rect x="78" y="32" width="44" height="42" rx="3" />,
    label: [100, 168],
    liquidTop: 128,
  },
  {
    bodyPath: "M60 108 h80 a14 14 0 0 1 14 14 v94 a14 14 0 0 1 -14 14 h-80 a14 14 0 0 1 -14 -14 v-94 a14 14 0 0 1 14 -14z",
    neck: [89, 92, 22, 18],
    cap: <rect x="84" y="22" width="32" height="72" rx="3" />,
    label: [100, 176],
    liquidTop: 136,
  },
  {
    bodyPath: "M72 90 h56 l20 138 q1 8 -7 8 h-82 q-8 0 -7 -8z",
    neck: [90, 72, 20, 20],
    cap: <circle cx="100" cy="50" r="24" />,
    label: [100, 172],
    liquidTop: 120,
  },
];

/**
 * Placeholder premium: frasco ilustrado, coherente con la estética del sitio.
 * Se usa cuando no hay una fotografía con derechos de uso.
 */
export function BottleArt({
  seed,
  family,
  brand,
  className,
  showLabel = true,
  variant,
}: {
  seed: string;
  family?: string | null;
  brand?: string;
  className?: string;
  showLabel?: boolean;
  variant?: number;
}) {
  const h = hash(seed);
  const shapeIndex = (variant ?? h) % SHAPES.length;
  const shape = SHAPES[shapeIndex];
  const tone = (family && FAMILY_TONES[family]) || DEFAULT_TONE;
  const id = `b${h.toString(36)}${shapeIndex}`;
  const [nx, ny, nw, nh] = shape.neck;

  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label="Ilustración de frasco (sin fotografía disponible)">
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={shape.bodyPath} />
        </clipPath>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone.liquid} stopOpacity="0.45" />
          <stop offset="1" stopColor={tone.liquid} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="246" rx="62" ry="6" fill="#594537" opacity="0.08" />

      {/* cristal */}
      <path d={shape.bodyPath} fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y={shape.liquidTop} width="200" height="200" fill={`url(#${id}-liquid)`} />
        <path d={`M0 ${shape.liquidTop} q50 -5 100 0 t100 0`} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
        <rect x="64" y="60" width="5" height="190" fill="#fff" opacity="0.55" rx="2.5" />
      </g>
      <path d={shape.bodyPath} fill="none" stroke="#594537" strokeOpacity="0.55" strokeWidth="1.2" />

      {/* cuello y tapa */}
      <rect x={nx} y={ny} width={nw} height={nh} fill="#EDE7DD" stroke="#594537" strokeOpacity="0.5" strokeWidth="1" />
      <g fill="#594537" fillOpacity="0.88" stroke="#594537" strokeWidth="1">
        {shape.cap}
      </g>

      {showLabel && brand && (
        <g>
          <rect x={shape.label[0] - 26} y={shape.label[1] - 15} width="52" height="30" rx="2" fill="#F5F3EE" stroke="#594537" strokeOpacity="0.35" strokeWidth="0.8" />
          <text
            x={shape.label[0]}
            y={shape.label[1] + 5}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="14"
            fill="#344B38"
            letterSpacing="1.5"
          >
            {initials(brand)}
          </text>
        </g>
      )}
    </svg>
  );
}
