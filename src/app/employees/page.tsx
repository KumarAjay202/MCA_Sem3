"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type Department = { id: string; name: string; code: string };
type Employee = {
  id: string;
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  designation: string;
  salary: number;
  hireDate: string;
  status: string;
  departmentId: string;
  department: Department;
};

const emptyForm = {
  empCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  salary: "",
  hireDate: "",
  departmentId: "",
  status: "ACTIVE",
};

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [items, setItems] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === "ADMIN" || user?.role === "HR";
  const canDelete = user?.role === "ADMIN";

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "8",
      sortBy: "empCode",
    });
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (departmentId) params.set("departmentId", departmentId);

    const res = await fetch(`/api/employees?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items);
    setTotalPages(data.pagination.totalPages);
    setLoading(false);
  }, [page, q, status, departmentId]);

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      setUser((await me.json()).user);
      const deps = await fetch("/api/departments");
      if (deps.ok) {
        const d = await deps.json();
        setDepartments(d.departments);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      departmentId: departments[0]?.id || "",
      hireDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
    setError("");
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({
      empCode: emp.empCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || "",
      designation: emp.designation,
      salary: String(emp.salary),
      hireDate: emp.hireDate.slice(0, 10),
      departmentId: emp.departmentId,
      status: emp.status,
    });
    setShowForm(true);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      empCode: form.empCode,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || null,
      designation: form.designation,
      salary: Number(form.salary),
      hireDate: form.hireDate,
      departmentId: form.departmentId,
      status: form.status as "ACTIVE" | "INACTIVE",
    };

    const body = editing
      ? {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          designation: payload.designation,
          salary: payload.salary,
          hireDate: payload.hireDate,
          departmentId: payload.departmentId,
          status: payload.status,
        }
      : payload;

    const res = await fetch(editing ? `/api/employees/${editing.id}` : "/api/employees", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setShowForm(false);
    setMessage(editing ? "Employee updated" : "Employee created");
    load();
  }

  async function softDelete(id: string) {
    if (!confirm("Mark this employee as INACTIVE (soft delete)?")) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    setMessage("Employee marked inactive");
    load();
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <AppShell
      user={user}
      title="Employees"
      subtitle="Search, filter, create, update, and soft-delete workforce records."
      action={
        canManage ? (
          <Button onClick={openCreate}>Add employee</Button>
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

      <Card className="mb-6">
        <CardContent className="grid gap-3 pt-5 md:grid-cols-4">
          <Input
            placeholder="Search name, email, code…"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={departmentId}
            onChange={(e) => {
              setPage(1);
              setDepartmentId(e.target.value);
            }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <Button variant="secondary" onClick={() => load()}>
            Refresh
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6 animate-fade-up">
          <CardHeader>
            <CardTitle>{editing ? "Edit employee" : "New employee"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
              {!editing && (
                <Input
                  placeholder="Employee code"
                  value={form.empCode}
                  onChange={(e) => setForm({ ...form, empCode: e.target.value })}
                  required
                />
              )}
              <Input
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Designation"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                required
              />
              <Input
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                required
              />
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">{editing ? "Save changes" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3">Hire date</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading employees…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                items.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs">{emp.empCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {fullName(emp.firstName, emp.lastName)}
                      </p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3">{emp.department.name}</td>
                    <td className="px-4 py-3">{emp.designation}</td>
                    <td className="px-4 py-3">{formatCurrency(emp.salary)}</td>
                    <td className="px-4 py-3">{formatDate(emp.hireDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={emp.status}>{emp.status}</Badge>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(emp)}>
                            Edit
                          </Button>
                          {canDelete && emp.status === "ACTIVE" && (
                            <Button size="sm" variant="danger" onClick={() => softDelete(emp.id)}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
