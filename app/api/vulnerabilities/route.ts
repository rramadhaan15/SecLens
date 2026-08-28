import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const scanner = searchParams.get("scanner");
    const owaspCategory = searchParams.get("owaspCategory");
    const projectId = searchParams.get("projectId");
    const assetId = searchParams.get("assetId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Prisma.VulnerabilityWhereInput = {};

    if (projectId) where.projectId = projectId;
    if (assetId) where.assetId = assetId;
    if (severity) where.severity = severity as any;
    if (status) where.status = status as any;
    if (scanner) where.scanner = scanner as any;
    if (owaspCategory) where.owaspCategory = { contains: owaspCategory };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { cveId: { contains: search, mode: "insensitive" } },
        { asset: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, vulnerabilities] = await Promise.all([
      prisma.vulnerability.count({ where }),
      prisma.vulnerability.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          project: { select: { id: true, name: true } },
          asset: { select: { id: true, name: true, target: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      vulnerabilities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Vulnerabilities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vulnerabilities" }, { status: 500 });
  }
}
