import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const projectSchema = z.object({
  name: z.string().min(2, "Project name required"),
  description: z.string().optional(),
  environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]).default("PRODUCTION"),
});

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            assets: true,
            scans: true,
            vulnerabilities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // Default to first user or demo user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "demo@seclens.local",
          name: "Demo Admin",
          passwordHash: "demo",
        },
      });
    }

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: project.id,
        details: `Created project ${project.name}`,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
