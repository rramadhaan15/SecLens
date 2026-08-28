import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const assetSchema = z.object({
  name: z.string().min(2, "Asset name required"),
  type: z.enum(["DOMAIN", "IP", "URL", "APPLICATION", "CONTAINER", "SERVER"]).default("URL"),
  target: z.string().min(1, "Asset target/URL required"),
  environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]).default("PRODUCTION"),
  riskLevel: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("HIGH"),
  projectId: z.string().min(1, "Project required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where = projectId ? { projectId } : {};

    const assets = await prisma.asset.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        _count: {
          select: {
            scans: true,
            vulnerabilities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Assets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = assetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const asset = await prisma.asset.create({
      data: parsed.data,
      include: {
        project: { select: { name: true } },
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Assets POST error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
