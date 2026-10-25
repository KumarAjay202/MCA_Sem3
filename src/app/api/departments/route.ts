import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(2).max(80),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { employees: true } },
    },
  });

  return NextResponse.json({ departments });
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

  try {
    const department = await prisma.department.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    });
    return NextResponse.json({ department }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Department code already exists" }, { status: 409 });
  }
}
