import { Sidebar } from "./sidebar";
import type { SessionUser } from "@/lib/auth";

export function AppShell({
  user,
  children,
  title,
  subtitle,
  action,
}: {
  user: SessionUser;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#ecfdf5_0%,_#f8fafc_45%,_#e2e8f0_100%)]">
      <Sidebar user={user} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
