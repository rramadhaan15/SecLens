import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { VulnStatus } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED_RISK", "FALSE_POSITIVE"]).optional(),
  assignedToId: z.string().nullable().optional(),
  remediationNote: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vuln = await prisma.vulnerability.findUnique({
      where: { id },
      include: {
        project: true,
        asset: true,
        scan: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        remediationActivities: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vuln) {
      return NextResponse.json({ error: "Vulnerability not found" }, { status: 404 });
    }

    return NextResponse.json(vuln);
  } catch (error) {
    console.error("Vulnerability GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vulnerability details" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const currentVuln = await prisma.vulnerability.findUnique({
      where: { id },
    });

    if (!currentVuln) {
      return NextResponse.json({ error: "Vulnerability not found" }, { status: 404 });
    }

    const { status, assignedToId, remediationNote } = parsed.data;

    const user = await prisma.user.findFirst();

    const updated = await prisma.vulnerability.update({
      where: { id },
      data: {
        status: status as VulnStatus | undefined,
        assignedToId: assignedToId === null ? null : assignedToId || undefined,
        remediation: remediationNote ? `${currentVuln.remediation || ""}\n[Note]: ${remediationNote}`.trim() : undefined,
      },
      include: {
        project: true,
        asset: true,
        assignedTo: true,
      },
    });

    if (status && status !== currentVuln.status && user) {
      await prisma.remediationActivity.create({
        data: {
          vulnerabilityId: currentVuln.id,
          userId: user.id,
          previousStatus: currentVuln.status,
          newStatus: status as VulnStatus,
          note: remediationNote || `Updated status from ${currentVuln.status} to ${status}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "VULNERABILITY_STATUS_CHANGED",
          entityType: "VULNERABILITY",
          entityId: currentVuln.id,
          details: `Changed vulnerability "${currentVuln.title}" status from ${currentVuln.status} to ${status}`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Vulnerability PATCH error:", error);
    return NextResponse.json({ error: "Failed to update vulnerability" }, { status: 500 });
  }
}
