import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireSession(["ADMIN", "HR"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { salary: "desc" },
  });

  const highSalary = employees.filter((e) => e.salary >= 900000 && e.status === "ACTIVE");

  const leaveSummary = await prisma.leaveRequest.groupBy({
    by: ["leaveType", "status"],
    _count: { _all: true },
  });

  const deptSalary = await prisma.employee.groupBy({
    by: ["departmentId"],
    where: { status: "ACTIVE" },
    _avg: { salary: true },
    _sum: { salary: true },
    _count: { _all: true },
  });

  const departments = await prisma.department.findMany();
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  return NextResponse.json({
    highSalaryEmployees: highSalary.map((e) => ({
      empCode: e.empCode,
      name: `${e.firstName} ${e.lastName}`,
      designation: e.designation,
      department: e.department.name,
      salary: e.salary,
    })),
    leaveSummary: leaveSummary.map((l) => ({
      leaveType: l.leaveType,
      status: l.status,
      count: l._count._all,
    })),
    departmentSalary: deptSalary.map((d) => ({
      department: deptMap[d.departmentId] || "Unknown",
      avgSalary: Math.round(d._avg.salary || 0),
      totalSalary: Math.round(d._sum.salary || 0),
      headcount: d._count._all,
    })),
    workforce: {
      total: employees.length,
      active: employees.filter((e) => e.status === "ACTIVE").length,
      inactive: employees.filter((e) => e.status === "INACTIVE").length,
      avgSalary: Math.round(
        employees.filter((e) => e.status === "ACTIVE").reduce((s, e) => s + e.salary, 0) /
          Math.max(1, employees.filter((e) => e.status === "ACTIVE").length)
      ),
    },
  });
}
