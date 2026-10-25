import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const session = await requireSession(["ADMIN", "HR"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden — HR/Admin only" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
  }
  if (existing.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending requests can be reviewed" }, { status: 400 });
  }

  const leave = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewedById: session.id,
      reviewedAt: new Date(),
    },
    include: {
      employee: {
        select: { empCode: true, firstName: true, lastName: true },
      },
      reviewer: { select: { name: true } },
    },
  });

  return NextResponse.json({ leave });
}
