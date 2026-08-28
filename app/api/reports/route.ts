import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SecurityScoreService } from "@/lib/scoring/security-score";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where = projectId ? { projectId } : {};

    const reports = await prisma.report.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        generatedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, title } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assets: true,
        scans: { take: 5, orderBy: { createdAt: "desc" } },
        vulnerabilities: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const openVulns = project.vulnerabilities.filter((v: any) => v.status === "OPEN" || v.status === "IN_PROGRESS");
    const resolvedVulns = project.vulnerabilities.filter((v: any) => v.status === "RESOLVED" || v.status === "ACCEPTED_RISK");

    const openCounts = {
      critical: openVulns.filter((v: any) => v.severity === "CRITICAL").length,
      high: openVulns.filter((v: any) => v.severity === "HIGH").length,
      medium: openVulns.filter((v: any) => v.severity === "MEDIUM").length,
      low: openVulns.filter((v: any) => v.severity === "LOW").length,
      info: openVulns.filter((v: any) => v.severity === "INFO").length,
      total: openVulns.length,
    };

    const scoreResult = SecurityScoreService.calculateScore(openCounts);

    const user = await prisma.user.findFirst();

    const summaryData = {
      projectName: project.name,
      environment: project.environment,
      generatedAt: new Date().toISOString(),
      score: scoreResult.score,
      tier: scoreResult.tier,
      totalAssets: project.assets.length,
      totalScans: project.scans.length,
      totalVulnerabilities: project.vulnerabilities.length,
      openCounts,
      topVulnerabilities: openVulns.slice(0, 5).map((v: any) => ({
        title: v.title,
        severity: v.severity,
        cveId: v.cveId,
        cweId: v.cweId,
        owaspCategory: v.owaspCategory,
        remediation: v.remediation,
      })),
      recommendations: [
        "Prioritize immediate remediation of Critical and High severity vulnerabilities.",
        "Implement strict network firewalls to restrict exposed management ports.",
        "Enforce HSTS and anti-clickjacking headers across web frontends.",
        "Establish automated container vulnerability scanning in CI/CD pipeline.",
      ],
    };

    const report = await prisma.report.create({
      data: {
        title: title || `Security Posture Report - ${project.name}`,
        summaryJson: JSON.stringify(summaryData),
        projectId: project.id,
        generatedById: user ? user.id : (await prisma.user.create({ data: { email: "admin@seclens.local", name: "Admin", passwordHash: "pass" } })).id,
      },
      include: {
        project: { select: { id: true, name: true } },
        generatedBy: { select: { name: true } },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Report POST error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
