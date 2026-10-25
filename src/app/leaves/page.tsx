"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, fullName } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type Leave = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  employee: {
    id: string;
    empCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
  };
  reviewer?: { name: string } | null;
};

type EmployeeOption = {
  id: string;
  empCode: string;
  firstName: string;
  lastName: string;
};

export default function LeavesPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canReview = user?.role === "ADMIN" || user?.role === "HR";

  async function load(status = filter) {
    const url = status ? `/api/leaves?status=${status}` : "/api/leaves";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setLeaves(data.leaves);
    }
  }

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      const session = (await me.json()).user as SessionUser;
      setUser(session);

      if (session.role !== "EMPLOYEE") {
        const empRes = await fetch("/api/employees?pageSize=50&status=ACTIVE");
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.items);
        }
      }
      await load();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload: Record<string, string> = {
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
    };
    if (user?.role !== "EMPLOYEE") {
      payload.employeeId = form.employeeId;
    }

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Submit failed");
      return;
    }
    setShowForm(false);
    setMessage("Leave request submitted");
    setForm({ employeeId: "", leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
    load(filter);
  }

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Review failed");
      return;
    }
    setMessage(`Leave ${status.toLowerCase()}`);
    load(filter);
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <AppShell
      user={user}
      title="Leave Requests"
      subtitle="Submit leave applications and review the approval workflow."
      action={<Button onClick={() => setShowForm(true)}>Request leave</Button>}
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

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Button
            key={s || "ALL"}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => {
              setFilter(s);
              load(s);
            }}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-6 animate-fade-up">
          <CardHeader>
            <CardTitle>New leave request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
              {user.role !== "EMPLOYEE" && (
                <select
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm sm:col-span-2"
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.empCode} — {fullName(emp.firstName, emp.lastName)}
                    </option>
                  ))}
                </select>
              )}
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              >
                <option value="CASUAL">Casual</option>
                <option value="SICK">Sick</option>
                <option value="EARNED">Earned</option>
                <option value="UNPAID">Unpaid</option>
              </select>
              <div />
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
              <textarea
                className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                placeholder="Reason (min 5 characters)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
                minLength={5}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {leaves.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              No leave requests found.
            </CardContent>
          </Card>
        ) : (
          leaves.map((leave) => (
            <Card key={leave.id}>
              <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {fullName(leave.employee.firstName, leave.employee.lastName)}
                    </p>
                    <Badge tone={leave.status}>{leave.status}</Badge>
                    <Badge>{leave.leaveType}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {leave.employee.empCode}
                    {leave.employee.department ? ` · ${leave.employee.department.name}` : ""} ·{" "}
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{leave.reason}</p>
                  {leave.reviewer && (
                    <p className="mt-1 text-xs text-slate-500">Reviewed by {leave.reviewer.name}</p>
                  )}
                </div>
                {canReview && leave.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => review(leave.id, "APPROVED")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => review(leave.id, "REJECTED")}>
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
