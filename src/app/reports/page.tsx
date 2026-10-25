"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type ReportData = {
  highSalaryEmployees: {
    empCode: string;
    name: string;
    designation: string;
    department: string;
    salary: number;
  }[];
  leaveSummary: { leaveType: string; status: string; count: number }[];
  departmentSalary: {
    department: string;
    avgSalary: number;
    totalSalary: number;
    headcount: number;
  }[];
  workforce: {
    total: number;
    active: number;
    inactive: number;
    avgSalary: number;
  };
};

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      const session = (await me.json()).user as SessionUser;
      if (session.role === "EMPLOYEE") {
        router.push("/dashboard");
        return;
      }
      setUser(session);

      const res = await fetch("/api/reports");
      if (!res.ok) {
        setError("Failed to load reports");
        return;
      }
      setData(await res.json());
    }
    load();
  }, [router]);

  if (!user || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        {error || "Loading reports…"}
      </div>
    );
  }

  return (
    <AppShell
      user={user}
      title="Reports"
      subtitle="Management views for salary bands, leave mix, and department cost."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Workforce", value: data.workforce.total },
          { label: "Active", value: data.workforce.active },
          { label: "Inactive", value: data.workforce.inactive },
          { label: "Avg salary", value: formatCurrency(data.workforce.avgSalary) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 font-display text-2xl text-slate-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average salary by department</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentSalary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="avgSalary" fill="#0e7490" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.leaveSummary.map((row, idx) => (
              <div
                key={`${row.leaveType}-${row.status}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span>
                  {row.leaveType} · {row.status}
                </span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>High salary employees (≥ ₹9,00,000)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Salary</th>
              </tr>
            </thead>
            <tbody>
              {data.highSalaryEmployees.map((emp) => (
                <tr key={emp.empCode} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{emp.empCode}</td>
                  <td className="px-4 py-3">{emp.name}</td>
                  <td className="px-4 py-3">{emp.designation}</td>
                  <td className="px-4 py-3">{emp.department}</td>
                  <td className="px-4 py-3">{formatCurrency(emp.salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
