import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalEmployees,
    activeEmployees,
    departments,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
    deptGroups,
    recentLeaves,
    recentEmployees,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.department.count(),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.leaveRequest.count({ where: { status: "APPROVED" } }),
    prisma.leaveRequest.count({ where: { status: "REJECTED" } }),
    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
      where: { status: "ACTIVE" },
    }),
    prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { firstName: true, lastName: true, empCode: true } },
      },
    }),
    prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { department: true },
    }),
  ]);

  const deptIds = deptGroups.map((d) => d.departmentId);
  const deptRows = await prisma.department.findMany({
    where: { id: { in: deptIds } },
  });
  const deptMap = Object.fromEntries(deptRows.map((d) => [d.id, d.name]));

  const headcountByDept = deptGroups.map((g) => ({
    name: deptMap[g.departmentId] || "Unknown",
    count: g._count._all,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = await prisma.attendance.groupBy({
    by: ["status"],
    where: { date: today },
    _count: { _all: true },
  });

  return NextResponse.json({
    stats: {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      departments,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    },
    headcountByDept,
    todayAttendance: todayAttendance.map((a) => ({
      status: a.status,
      count: a._count._all,
    })),
    recentLeaves,
    recentEmployees,
  });
}
