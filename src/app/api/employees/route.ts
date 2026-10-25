import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  empCode: z.string().min(2).max(20),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  designation: z.string().min(1),
  salary: z.number().positive(),
  hireDate: z.string(),
  departmentId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() || "";
  const departmentId = searchParams.get("departmentId") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)));
  const sortBy = searchParams.get("sortBy") || "empCode";
  const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";

  const where = {
    AND: [
      q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
              { empCode: { contains: q } },
              { designation: { contains: q } },
            ],
          }
        : {},
      departmentId ? { departmentId } : {},
      status ? { status } : {},
    ],
  };

  const allowedSort = ["empCode", "firstName", "salary", "hireDate", "status"];
  const orderField = allowedSort.includes(sortBy) ? sortBy : "empCode";

  const [total, items] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      include: { department: true },
      orderBy: { [orderField]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(["ADMIN", "HR"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const employee = await prisma.employee.create({
      data: {
        empCode: data.empCode.toUpperCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        designation: data.designation,
        salary: data.salary,
        hireDate: new Date(data.hireDate),
        departmentId: data.departmentId,
        status: data.status,
      },
      include: { department: true },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Employee code or email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
