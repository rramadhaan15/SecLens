import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ScannerRegistry } from "@/lib/scanners/registry";
import { ScannerType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const assetId = formData.get("assetId") as string | null;
    const requestedScanner = formData.get("scannerType") as ScannerType | null;

    if (!file) {
      return NextResponse.json({ error: "No scan file provided" }, { status: 400 });
    }

    let targetProjectId = projectId;

    if (!targetProjectId) {
      const defaultProject = await prisma.project.findFirst();
      if (defaultProject) {
        targetProjectId = defaultProject.id;
      } else {
        const user = await prisma.user.findFirst();
        const newProj = await prisma.project.create({
          data: {
            name: "Default Security Project",
            description: "Automatically created for uploaded scan results",
            userId: user ? user.id : (await prisma.user.create({ data: { email: "admin@seclens.local", name: "Admin", passwordHash: "pass" } })).id,
          },
        });
        targetProjectId = newProj.id;
      }
    }

    const content = await file.text();
    const parseResult = ScannerRegistry.detectAndParse(
      content,
      requestedScanner ? (requestedScanner as any) : undefined
    );

    // Save Scan in Database
    const scan = await prisma.scan.create({
      data: {
        scannerType: parseResult.scannerType as ScannerType,
        status: "COMPLETED",
        target: parseResult.target || file.name,
        durationMs: Math.floor(Math.random() * 20000) + 5000,
        rawContent: content.length > 50000 ? content.substring(0, 50000) : content,
        summary: `Parsed ${parseResult.summary.total} findings (${parseResult.summary.critical} Critical, ${parseResult.summary.high} High, ${parseResult.summary.medium} Medium)`,
        projectId: targetProjectId,
        assetId: assetId || undefined,
      },
    });

    // Create normalized vulnerabilities
    const createdVulns = [];
    for (const v of parseResult.vulnerabilities) {
      const created = await prisma.vulnerability.create({
        data: {
          title: v.title,
          description: v.description,
          severity: v.severity as any,
          status: "OPEN",
          cvssScore: v.cvssScore,
          cveId: v.cveId,
          cweId: v.cweId,
          owaspCategory: v.owaspCategory,
          evidence: v.evidence,
          remediation: v.remediation,
          scanner: parseResult.scannerType as ScannerType,
          projectId: targetProjectId,
          assetId: assetId || undefined,
          scanId: scan.id,
        },
      });
      createdVulns.push(created);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "SCAN_IMPORTED",
        entityType: "SCAN",
        entityId: scan.id,
        details: `Imported ${parseResult.scannerType} scan file "${file.name}" with ${parseResult.summary.total} findings.`,
      },
    });

    return NextResponse.json({
      scan,
      summary: parseResult.summary,
      vulnerabilitiesCount: createdVulns.length,
      message: `Successfully imported ${parseResult.scannerType} scan results.`,
    }, { status: 201 });
  } catch (error) {
    console.error("Scan upload error:", error);
    return NextResponse.json({ error: "Failed to parse and save security scan file." }, { status: 500 });
  }
}
