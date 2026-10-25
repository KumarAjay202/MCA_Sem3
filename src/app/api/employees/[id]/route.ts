import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  designation: z.string().min(1).optional(),
  salary: z.number().positive().optional(),
  hireDate: z.string().optional(),
  departmentId: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 10 },
      attendances: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json({ employee });
}

export async function PUT(request: NextRequest, context: Ctx) {
  const session = await requireSession(["ADMIN", "HR"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        email: data.email?.toLowerCase(),
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
      include: { department: true },
    });
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const session = await requireSession(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return NextResponse.json({
      employee,
      message: "Employee soft-deleted (marked INACTIVE)",
    });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
