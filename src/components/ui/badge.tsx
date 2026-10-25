import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
  PRESENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ABSENT: "bg-rose-50 text-rose-800 border-rose-200",
  HALF_DAY: "bg-amber-50 text-amber-800 border-amber-200",
  ON_LEAVE: "bg-sky-50 text-sky-800 border-sky-200",
  ADMIN: "bg-teal-50 text-teal-900 border-teal-200",
  HR: "bg-cyan-50 text-cyan-900 border-cyan-200",
  EMPLOYEE: "bg-slate-100 text-slate-700 border-slate-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        styles[tone] || styles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
