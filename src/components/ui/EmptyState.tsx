import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  text,
  action,
  className,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-ivory/50 px-6 py-14 text-center", className)}>
      <svg viewBox="0 0 64 64" className="mb-5 size-14 text-sage" aria-hidden>
        <rect x="22" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="28" y="18" width="8" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="24" width="36" height="34" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 42h36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
      <h3 className="text-2xl">{title}</h3>
      {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
