"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullName } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type AttendanceRow = {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  employee: {
    empCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
  };
};

type EmployeeOption = {
  id: string;
  empCode: string;
  firstName: string;
  lastName: string;
};

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    date: new Date().toISOString().slice(0, 10),
    checkIn: "09:30",
    checkOut: "18:00",
    status: "PRESENT",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "HR";

  async function load(selectedDate = date) {
    const res = await fetch(`/api/attendance?date=${selectedDate}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.attendance);
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
          setEmployees((await empRes.json()).items);
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
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        checkIn: form.status === "ABSENT" || form.status === "ON_LEAVE" ? null : form.checkIn,
        checkOut: form.status === "ABSENT" || form.status === "ON_LEAVE" ? null : form.checkOut,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setMessage("Attendance saved");
    setShowForm(false);
    if (form.date === date) load();
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <AppShell
      user={user}
      title="Attendance"
      subtitle="Daily presence records with check-in / check-out times."
      action={
        canManage ? <Button onClick={() => setShowForm(true)}>Mark attendance</Button> : undefined
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
        <CardContent className="flex flex-wrap items-end gap-3 pt-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button
            onClick={() => {
              load(date);
            }}
          >
            Load
          </Button>
        </CardContent>
      </Card>

      {showForm && canManage && (
        <Card className="mb-6 animate-fade-up">
          <CardHeader>
            <CardTitle>Mark / update attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
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
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half day</option>
                <option value="ON_LEAVE">On leave</option>
              </select>
              <Input
                placeholder="Check-in (HH:MM)"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
              <Input
                placeholder="Check-out (HH:MM)"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save</Button>
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
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No attendance records for this date.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {fullName(row.employee.firstName, row.employee.lastName)}
                      </p>
                      <p className="text-xs text-slate-500">{row.employee.empCode}</p>
                    </td>
                    <td className="px-4 py-3">{row.employee.department?.name || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.checkIn || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.checkOut || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.status}>{row.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
