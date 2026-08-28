import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where = projectId ? { projectId } : {};

    const [allVulns, activities] = await Promise.all([
      prisma.vulnerability.findMany({
        where,
        include: {
          project: { select: { name: true } },
          asset: { select: { name: true } },
          assignedTo: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.remediationActivity.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: {
          vulnerability: { select: { title: true, severity: true } },
          user: { select: { name: true } },
        },
      }),
    ]);

    const metrics = {
      open: allVulns.filter((v: any) => v.status === "OPEN").length,
      inProgress: allVulns.filter((v: any) => v.status === "IN_PROGRESS").length,
      resolved: allVulns.filter((v: any) => v.status === "RESOLVED").length,
      acceptedRisk: allVulns.filter((v: any) => v.status === "ACCEPTED_RISK" || v.status === "FALSE_POSITIVE").length,
      total: allVulns.length,
    };

    return NextResponse.json({
      metrics,
      vulnerabilities: allVulns,
      activities,
    });
  } catch (error) {
    console.error("Remediation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch remediation workflow data" }, { status: 500 });
  }
}
