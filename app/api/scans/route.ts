import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const whereClause = projectId ? { projectId } : {};

    const scans = await prisma.scan.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true } },
        asset: { select: { id: true, name: true } },
        _count: { select: { vulnerabilities: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scans);
  } catch (error) {
    console.error("Scans GET error:", error);
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
  }
}
