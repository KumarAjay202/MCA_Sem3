import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string(),
  date: z.string(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"]),
});

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  const employeeIdParam = request.nextUrl.searchParams.get("employeeId");

  const day = dateParam ? new Date(dateParam) : new Date();
  day.setHours(0, 0, 0, 0);

  const where: {
    date: Date;
    employeeId?: string;
  } = { date: day };

  if (session.role === "EMPLOYEE") {
    where.employeeId = session.employeeId || "__none__";
  } else if (employeeIdParam) {
    where.employeeId = employeeIdParam;
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      employee: {
        select: {
          empCode: true,
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { employee: { empCode: "asc" } },
  });

  return NextResponse.json({ date: day.toISOString(), attendance });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(["ADMIN", "HR"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const date = new Date(parsed.data.date);
  date.setHours(0, 0, 0, 0);

  const record = await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId: parsed.data.employeeId,
        date,
      },
    },
    create: {
      employeeId: parsed.data.employeeId,
      date,
      checkIn: parsed.data.checkIn || null,
      checkOut: parsed.data.checkOut || null,
      status: parsed.data.status,
    },
    update: {
      checkIn: parsed.data.checkIn || null,
      checkOut: parsed.data.checkOut || null,
      status: parsed.data.status,
    },
    include: {
      employee: {
        select: { empCode: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json({ attendance: record });
}
