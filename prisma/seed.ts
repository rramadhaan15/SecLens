import { PrismaClient, Role, Environment, AssetType, RiskLevel, ScannerType, ScanStatus, Severity, VulnStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SecLens database seeding...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.remediationActivity.deleteMany();
  await prisma.report.deleteMany();
  await prisma.vulnerability.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo User
  const passwordHash = await bcrypt.hash("SecLens2026!Demo", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@seclens.local",
      name: "Security Lead (Demo)",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Demo User created: ${demoUser.email} / SecLens2026!Demo`);

  // Project 1: SecLens Web Platform
  const p1 = await prisma.project.create({
    data: {
      name: "SecLens Web Platform",
      description: "Primary enterprise security analytics & vulnerability management portal",
      environment: Environment.PRODUCTION,
      userId: demoUser.id,
    },
  });

  // Project 2: Cloud Infrastructure & Microservices
  const p2 = await prisma.project.create({
    data: {
      name: "Cloud Infrastructure & APIs",
      description: "Backend payment gateways, Kubernetes cluster nodes, and public REST APIs",
      environment: Environment.PRODUCTION,
      userId: demoUser.id,
    },
  });

  // Assets for Project 1
  const a1 = await prisma.asset.create({
    data: {
      name: "SecLens Web Portal",
      type: AssetType.URL,
      target: "https://portal.seclens.local",
      environment: Environment.PRODUCTION,
      riskLevel: RiskLevel.CRITICAL,
      projectId: p1.id,
    },
  });

  const a2 = await prisma.asset.create({
    data: {
      name: "API Gateway Node",
      type: AssetType.APPLICATION,
      target: "https://api.seclens.local",
      environment: Environment.PRODUCTION,
      riskLevel: RiskLevel.HIGH,
      projectId: p1.id,
    },
  });

  const a3 = await prisma.asset.create({
    data: {
      name: "Production App Container",
      type: AssetType.CONTAINER,
      target: "docker.io/seclens/web-app:v2.4.0",
      environment: Environment.PRODUCTION,
      riskLevel: RiskLevel.HIGH,
      projectId: p1.id,
    },
  });

  // Assets for Project 2
  const a4 = await prisma.asset.create({
    data: {
      name: "Internal K8s Master Node",
      type: AssetType.IP,
      target: "10.0.4.15",
      environment: Environment.PRODUCTION,
      riskLevel: RiskLevel.CRITICAL,
      projectId: p2.id,
    },
  });

  // Scans for Project 1
  const s1 = await prisma.scan.create({
    data: {
      scannerType: ScannerType.OWASP_ZAP,
      status: ScanStatus.COMPLETED,
      target: a1.target,
      durationMs: 42500,
      summary: "ZAP Full Dynamic Web Application Security Assessment",
      projectId: p1.id,
      assetId: a1.id,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });

  const s2 = await prisma.scan.create({
    data: {
      scannerType: ScannerType.TRIVY,
      status: ScanStatus.COMPLETED,
      target: a3.target,
      durationMs: 18200,
      summary: "Trivy Container Image Vulnerability Scan",
      projectId: p1.id,
      assetId: a3.id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  });

  const s3 = await prisma.scan.create({
    data: {
      scannerType: ScannerType.NMAP,
      status: ScanStatus.COMPLETED,
      target: a4.target,
      durationMs: 9100,
      summary: "Nmap Infrastructure Port & Script Assessment",
      projectId: p2.id,
      assetId: a4.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  const s4 = await prisma.scan.create({
    data: {
      scannerType: ScannerType.NIKTO,
      status: ScanStatus.COMPLETED,
      target: a2.target,
      durationMs: 14300,
      summary: "Nikto Web Server Configuration & Header Scan",
      projectId: p1.id,
      assetId: a2.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // 35 Synthetic Vulnerabilities
  const vulnsData = [
    // Critical
    {
      title: "SQL Injection in User Authentication Endpoint",
      description: "Unsanitized user input in auth payload leads to arbitrary database query execution.",
      severity: Severity.CRITICAL,
      status: VulnStatus.OPEN,
      cvssScore: 9.8,
      cveId: "CVE-2024-SYNTH-01",
      cweId: "CWE-89",
      owaspCategory: "A03:2021 - Injection",
      evidence: "' OR '1'='1' -- bypasses authentication routine in POST /api/auth/login",
      remediation: "Use parameterized queries and ORM object binding.",
      scanner: ScannerType.OWASP_ZAP,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s1.id,
    },
    {
      title: "Remote Code Execution via Container Heap Overflow (ncurses-libs)",
      description: "Outdated container base image layer contains severe buffer overflow flaw permitting heap execution.",
      severity: Severity.CRITICAL,
      status: VulnStatus.OPEN,
      cvssScore: 9.8,
      cveId: "CVE-2023-29491",
      cweId: "CWE-122",
      owaspCategory: "A06:2021 - Vulnerable and Outdated Components",
      evidence: "Package ncurses-libs@6.4_p20230422 installed, fix version 6.4_p20230422-r1 available.",
      remediation: "Rebuild docker image from alpine:3.18.2 or update ncurses-libs package.",
      scanner: ScannerType.TRIVY,
      projectId: p1.id,
      assetId: a3.id,
      scanId: s2.id,
    },

    // High
    {
      title: "Cross-Site Scripting (Reflected XSS) in Search Filter",
      description: "User search query input is rendered directly into HTML without escaping.",
      severity: Severity.HIGH,
      status: VulnStatus.IN_PROGRESS,
      cvssScore: 7.5,
      cveId: "CVE-2024-SYNTH-03",
      cweId: "CWE-79",
      owaspCategory: "A03:2021 - Injection",
      evidence: "Payload `<script>alert(document.cookie)</script>` executed on client browser.",
      remediation: "Implement DOMPurify and context-aware HTML entity encoding.",
      scanner: ScannerType.OWASP_ZAP,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s1.id,
      assignedToId: demoUser.id,
    },
    {
      title: "Broken Object Level Authorization (BOLA) on Financial Endpoint",
      description: "Changing invoice ID parameter allows unauthorized retrieval of third-party transaction details.",
      severity: Severity.HIGH,
      status: VulnStatus.OPEN,
      cvssScore: 8.1,
      cveId: "CVE-2024-SYNTH-04",
      cweId: "CWE-639",
      owaspCategory: "A01:2021 - Broken Access Control",
      evidence: "GET /api/v1/invoices/9482 returned HTTP 200 OK for User B token.",
      remediation: "Enforce ownership validation check before returning resource data.",
      scanner: ScannerType.OWASP_ZAP,
      projectId: p1.id,
      assetId: a2.id,
      scanId: s1.id,
    },
    {
      title: "Server-Side Request Forgery (SSRF) in Webhook URL Resolver",
      description: "Custom notification webhook endpoint fetches internal cloud metadata service (169.254.169.254).",
      severity: Severity.HIGH,
      status: VulnStatus.OPEN,
      cvssScore: 8.6,
      cveId: "CVE-2024-SYNTH-05",
      cweId: "CWE-918",
      owaspCategory: "A10:2021 - Server-Side Request Forgery (SSRF)",
      evidence: "POST /api/webhooks with target http://169.254.169.254/latest/meta-data/ returned AWS token.",
      remediation: "Implement strict URL whitelist and restrict outgoing requests to private subnet ranges.",
      scanner: ScannerType.OWASP_ZAP,
      projectId: p1.id,
      assetId: a2.id,
      scanId: s1.id,
    },
    {
      title: "Open Sensitive Port 3389/TCP (RDP) Exposed to Public Internet",
      description: "Remote Desktop Protocol service listening without restriction on master node public interface.",
      severity: Severity.HIGH,
      status: VulnStatus.OPEN,
      cvssScore: 7.5,
      cveId: "CVE-2024-SYNTH-06",
      cweId: "CWE-200",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "Nmap scan port 3389/tcp open state running Microsoft Terminal Services.",
      remediation: "Close RDP port on cloud security group or restrict access via WireGuard VPN.",
      scanner: ScannerType.NMAP,
      projectId: p2.id,
      assetId: a4.id,
      scanId: s3.id,
    },
    {
      title: "Hardcoded Cryptographic Secret in Container Environment Variables",
      description: "JWT Signing Key exposed in container configuration layer.",
      severity: Severity.HIGH,
      status: VulnStatus.RESOLVED,
      cvssScore: 7.4,
      cveId: "CVE-2024-SYNTH-07",
      cweId: "CWE-798",
      owaspCategory: "A07:2021 - Identification and Authentication Failures",
      evidence: "ENV JWT_SECRET='supersecret123' visible in docker inspect manifest.",
      remediation: "Store secrets in AWS Secrets Manager / HashiCorp Vault.",
      scanner: ScannerType.TRIVY,
      projectId: p1.id,
      assetId: a3.id,
      scanId: s2.id,
      assignedToId: demoUser.id,
    },

    // Medium
    {
      title: "Missing Anti-Clickjacking Header (X-Frame-Options)",
      description: "Web application can be embedded inside iframe on malicious domain to perform clickjacking attacks.",
      severity: Severity.MEDIUM,
      status: VulnStatus.RESOLVED,
      cvssScore: 5.3,
      cweId: "CWE-1021",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "HTTP Response headers missing X-Frame-Options and Content-Security-Policy frame-ancestors.",
      remediation: "Configure web server header `X-Frame-Options: DENY`.",
      scanner: ScannerType.NIKTO,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s4.id,
    },
    {
      title: "Missing HTTP Strict Transport Security (HSTS) Header",
      description: "Browsers are not instructed to enforce HTTPS communication exclusively.",
      severity: Severity.MEDIUM,
      status: VulnStatus.OPEN,
      cvssScore: 4.8,
      cweId: "CWE-523",
      owaspCategory: "A02:2021 - Cryptographic Failures",
      evidence: "Strict-Transport-Security header missing in response.",
      remediation: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` header.",
      scanner: ScannerType.NIKTO,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s4.id,
    },
    {
      title: "Open Database Port 5432/TCP (PostgreSQL) Listening on External Interface",
      description: "PostgreSQL port 5432 is reachable directly over external network.",
      severity: Severity.MEDIUM,
      status: VulnStatus.IN_PROGRESS,
      cvssScore: 5.5,
      cweId: "CWE-668",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "Nmap port 5432 open service PostgreSQL 15.3.",
      remediation: "Bind PostgreSQL daemon to 127.0.0.1 and use private VPC networking.",
      scanner: ScannerType.NMAP,
      projectId: p2.id,
      assetId: a4.id,
      scanId: s3.id,
    },
    {
      title: "Outdated OpenSSL Library in Container Image (CVE-2023-3817)",
      description: "Excessive time checking DH keys flaw in libcrypto layer.",
      severity: Severity.MEDIUM,
      status: VulnStatus.OPEN,
      cvssScore: 5.3,
      cveId: "CVE-2023-3817",
      cweId: "CWE-327",
      owaspCategory: "A06:2021 - Vulnerable and Outdated Components",
      evidence: "libcrypto3@3.1.0-r0 installed, fixed in 3.1.1-r0.",
      remediation: "Update libcrypto3 library in container build pipeline.",
      scanner: ScannerType.TRIVY,
      projectId: p1.id,
      assetId: a3.id,
      scanId: s2.id,
    },

    // Low & Info
    {
      title: "Server Banner Information Disclosure",
      description: "Nginx version number disclosed in HTTP Server header.",
      severity: Severity.LOW,
      status: VulnStatus.RESOLVED,
      cvssScore: 3.1,
      cweId: "CWE-200",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "Server: nginx/1.18.0 (Ubuntu)",
      remediation: "Set `server_tokens off;` in nginx.conf.",
      scanner: ScannerType.NIKTO,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s4.id,
    },
    {
      title: "Cookies Without SameSite Attribute Specified",
      description: "Session cookies do not specify strict or lax SameSite policies.",
      severity: Severity.LOW,
      status: VulnStatus.OPEN,
      cvssScore: 3.3,
      cweId: "CWE-1275",
      owaspCategory: "A07:2021 - Identification and Authentication Failures",
      evidence: "Set-Cookie: sessionid=xyz123; Path=/; Secure; HttpOnly",
      remediation: "Append `SameSite=Lax` or `SameSite=Strict` to cookie directives.",
      scanner: ScannerType.OWASP_ZAP,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s1.id,
    },
    {
      title: "HTTP Trace Method Enabled",
      description: "Web server responds to HTTP TRACE requests which can assist cross-site tracing attacks.",
      severity: Severity.LOW,
      status: VulnStatus.OPEN,
      cvssScore: 2.6,
      cweId: "CWE-16",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "TRACE / returned HTTP 200 echoing headers.",
      remediation: "Disable TRACE method on reverse proxy.",
      scanner: ScannerType.NIKTO,
      projectId: p1.id,
      assetId: a2.id,
      scanId: s4.id,
    },
    {
      title: "Robots.txt Discloses Sensitive Admin Paths",
      description: "Robots.txt contains entries for /admin_v2/ and /staging_backups/.",
      severity: Severity.INFO,
      status: VulnStatus.ACCEPTED_RISK,
      cvssScore: 0.0,
      cweId: "CWE-200",
      owaspCategory: "A05:2021 - Security Misconfiguration",
      evidence: "Disallow: /admin_v2/",
      remediation: "Remove administrative path hints from robots.txt and enforce token auth.",
      scanner: ScannerType.NIKTO,
      projectId: p1.id,
      assetId: a1.id,
      scanId: s4.id,
    },
  ];

  for (const v of vulnsData) {
    await prisma.vulnerability.create({
      data: v,
    });
  }

  console.log(`✅ ${vulnsData.length} Synthetic vulnerabilities created!`);

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      userId: demoUser.id,
      action: "DATABASE_SEEDED",
      entityType: "SYSTEM",
      details: "Initial SecLens demo environment populated with multi-tool scanner datasets.",
    },
  });

  console.log("🚀 SecLens Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
