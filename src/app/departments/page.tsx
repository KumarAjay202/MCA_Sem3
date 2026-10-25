"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionUser } from "@/lib/auth";

type Department = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count: { employees: number };
};

export default function DepartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "HR";
  const canDelete = user?.role === "ADMIN";

  async function load() {
    const res = await fetch("/api/departments");
    if (res.ok) {
      const data = await res.json();
      setDepartments(data.departments);
    }
  }

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      setUser((await me.json()).user);
      await load();
    }
    init();
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Create failed");
      return;
    }
    setShowForm(false);
    setForm({ code: "", name: "", description: "" });
    setMessage("Department created");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this department?")) return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    setMessage("Department deleted");
    load();
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <AppShell
      user={user}
      title="Departments"
      subtitle="Organize the company structure that employees belong to."
      action={
        canManage ? (
          <Button onClick={() => setShowForm(true)}>Add department</Button>
        ) : undefined
      }
    >
      {(message || error) && (
        <p
          className={`mb-4 rounded-md border px-3 py-2 text-sm ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </p>
      )}

      {showForm && (
        <Card className="mb-6 animate-fade-up">
          <CardHeader>
            <CardTitle>New department</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Code (e.g. ENG)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-3">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept, i) => (
          <Card key={dept.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-teal-800">{dept.code}</p>
                  <h3 className="font-display text-xl text-slate-900">{dept.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {dept.description || "No description"}
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {dept._count.employees} staff
                </span>
              </div>
              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => remove(dept.id)}
                >
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
