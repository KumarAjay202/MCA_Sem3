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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, fullName } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type DashboardData = {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    departments: number;
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
  };
  headcountByDept: { name: string; count: number }[];
  todayAttendance: { status: string; count: number }[];
  recentLeaves: {
    id: string;
    leaveType: string;
    status: string;
    startDate: string;
    employee: { firstName: string; lastName: string; empCode: string };
  }[];
  recentEmployees: {
    id: string;
    firstName: string;
    lastName: string;
    empCode: string;
    designation: string;
    department: { name: string };
  }[];
};

const PIE_COLORS = ["#0f766e", "#0891b2", "#b45309", "#be123c"];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      const meJson = await me.json();
      setUser(meJson.user);

      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        setError("Failed to load dashboard");
        return;
      }
      setData(await res.json());
    }
    load();
  }, [router]);

  if (!user || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        {error || "Loading dashboard…"}
      </div>
    );
  }

  const stats = [
    { label: "Total employees", value: data.stats.totalEmployees },
    { label: "Active", value: data.stats.activeEmployees },
    { label: "Departments", value: data.stats.departments },
    { label: "Pending leaves", value: data.stats.pendingLeaves },
  ];

  return (
    <AppShell
      user={user}
      title="Dashboard"
      subtitle="Live snapshot of workforce strength, leave pipeline, and attendance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 font-display text-3xl text-slate-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <CardHeader>
            <CardTitle>Headcount by department</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.headcountByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: "220ms" }}>
          <CardHeader>
            <CardTitle>Today&apos;s attendance mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {data.todayAttendance.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No attendance marked for today yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.todayAttendance}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.todayAttendance.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent leave requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentLeaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {fullName(leave.employee.firstName, leave.employee.lastName)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {leave.employee.empCode} · {leave.leaveType} · {formatDate(leave.startDate)}
                  </p>
                </div>
                <Badge tone={leave.status}>{leave.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently added employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {fullName(emp.firstName, emp.lastName)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {emp.empCode} · {emp.designation}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{emp.department.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
