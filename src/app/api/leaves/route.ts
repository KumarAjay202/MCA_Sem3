import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().optional(),
  leaveType: z.enum(["CASUAL", "SICK", "EARNED", "UNPAID"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(5).max(500),
});

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const where =
    session.role === "EMPLOYEE"
      ? {
          employeeId: session.employeeId || "__none__",
          ...(status ? { status } : {}),
        }
      : status
        ? { status }
        : {};

  const leaves = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          empCode: true,
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
      reviewer: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ leaves });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  let employeeId = parsed.data.employeeId;
  if (session.role === "EMPLOYEE") {
    if (!session.employeeId) {
      return NextResponse.json({ error: "No employee profile linked" }, { status: 400 });
    }
    employeeId = session.employeeId;
  }

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (end < start) {
    return NextResponse.json({ error: "End date cannot be before start date" }, { status: 400 });
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType: parsed.data.leaveType,
      startDate: start,
      endDate: end,
      reason: parsed.data.reason,
      status: "PENDING",
    },
    include: {
      employee: {
        select: { empCode: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json({ leave }, { status: 201 });
}
