import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(20,184,166,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 10%, rgba(14,116,144,0.3), transparent 50%), linear-gradient(160deg, #042f2e 0%, #0f172a 55%, #020617 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-2xl tracking-tight">SmartHR</p>
        <Link href="/login">
          <Button className="bg-teal-500 text-slate-950 hover:bg-teal-400">Open console</Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 lg:pt-24">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-teal-300/90">
            MCA Project · Kurukshetra University
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            SmartHR
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            A live employee lifecycle system — hire records, departments, leave approvals,
            attendance, and workforce reports with role-based access.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg" className="bg-teal-400 text-slate-950 hover:bg-teal-300">
                Launch demo
              </Button>
            </Link>
            <a href="#modules">
              <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                See modules
              </Button>
            </a>
          </div>
        </div>

        <section
          id="modules"
          className="grid gap-4 animate-fade-up sm:grid-cols-3"
          style={{ animationDelay: "120ms" }}
        >
          {[
            {
              title: "Workforce directory",
              body: "Search, filter, and manage employee records with soft delete and department mapping.",
            },
            {
              title: "Leave workflow",
              body: "Employees submit requests; HR and Admin approve or reject with audit of reviewer.",
            },
            {
              title: "Live reports",
              body: "Headcount, salary bands, leave summary, and attendance snapshots for viva demos.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10"
            >
              <h2 className="font-display text-xl text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
            </article>
          ))}
        </section>

        <p className="animate-fade-in text-sm text-slate-400" style={{ animationDelay: "240ms" }}>
          Built by Ajay Kumar · Enrollment 24DEOJULYMCA00126 · Student ID 10976147
        </p>
      </main>
    </div>
  );
}
