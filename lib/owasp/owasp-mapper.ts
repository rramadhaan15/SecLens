export interface OwaspCategory {
  code: string;
  name: string;
  description: string;
}

export const OWASP_TOP_10_2021: Record<string, OwaspCategory> = {
  A01: {
    code: "A01:2021",
    name: "Broken Access Control",
    description: "Failures in access control policies permitting unauthorized disclosure, modification, or destruction.",
  },
  A02: {
    code: "A02:2021",
    name: "Cryptographic Failures",
    description: "Failures related to cryptography (or lack thereof), leading to exposure of sensitive data.",
  },
  A03: {
    code: "A03:2021",
    name: "Injection",
    description: "SQL, NoSQL, OS command, ORM, LDAP, or Expression Language injections.",
  },
  A04: {
    code: "A04:2021",
    name: "Insecure Design",
    description: "Risks related to architectural flaws and missing design patterns.",
  },
  A05: {
    code: "A05:2021",
    name: "Security Misconfiguration",
    description: "Unnecessary features enabled, default accounts, open cloud storage, verbose error messages.",
  },
  A06: {
    code: "A06:2021",
    name: "Vulnerable and Outdated Components",
    description: "Using software with known vulnerabilities, unsupported software, or outdated libraries.",
  },
  A07: {
    code: "A07:2021",
    name: "Identification and Authentication Failures",
    description: "Permitting automated attacks, weak passwords, missing multi-factor, session fixation.",
  },
  A08: {
    code: "A08:2021",
    name: "Software and Data Integrity Failures",
    description: "Code and infrastructure that does not protect against integrity violations (e.g. untrusted CI/CD pipelines).",
  },
  A09: {
    code: "A09:2021",
    name: "Security Logging and Monitoring Failures",
    description: "Insufficient logging, detection, monitoring, and active response.",
  },
  A10: {
    code: "A10:2021",
    name: "Server-Side Request Forgery (SSRF)",
    description: "Fetching a remote resource without validating the user-supplied URL.",
  },
};

export function mapToOwaspCategory(title: string, cweId?: string, description?: string): string {
  const text = `${title} ${description || ""} ${cweId || ""}`.toLowerCase();

  // CWE mapping
  if (cweId) {
    const cweNum = parseInt(cweId.replace(/\D/g, ""), 10);
    if ([22, 284, 285, 639, 862, 863].includes(cweNum)) return "A01:2021 - Broken Access Control";
    if ([259, 310, 311, 319, 326, 327].includes(cweNum)) return "A02:2021 - Cryptographic Failures";
    if ([77, 78, 79, 89, 94, 502].includes(cweNum)) return "A03:2021 - Injection";
    if ([16, 2, 215, 1004].includes(cweNum)) return "A05:2021 - Security Misconfiguration";
    if ([937, 1104].includes(cweNum)) return "A06:2021 - Vulnerable and Outdated Components";
    if ([287, 307, 384, 798].includes(cweNum)) return "A07:2021 - Identification and Authentication Failures";
    if ([918].includes(cweNum)) return "A10:2021 - Server-Side Request Forgery (SSRF)";
  }

  // Keyword mapping
  if (text.includes("access control") || text.includes("traversal") || text.includes("cors") || text.includes("privilege") || text.includes("bypass")) {
    return "A01:2021 - Broken Access Control";
  }
  if (text.includes("ssl") || text.includes("tls") || text.includes("certificate") || text.includes("crypto") || text.includes("plain text") || text.includes("encryption")) {
    return "A02:2021 - Cryptographic Failures";
  }
  if (text.includes("sql") || text.includes("xss") || text.includes("scripting") || text.includes("command injection") || text.includes("ldap") || text.includes("injection")) {
    return "A03:2021 - Injection";
  }
  if (text.includes("csrf") || text.includes("architecture") || text.includes("business logic")) {
    return "A04:2021 - Insecure Design";
  }
  if (text.includes("header") || text.includes("misconfig") || text.includes("default") || text.includes("disclosure") || text.includes("banner") || text.includes("directory listing")) {
    return "A05:2021 - Security Misconfiguration";
  }
  if (text.includes("outdated") || text.includes("vulnerable component") || text.includes("cve") || text.includes("package") || text.includes("lib")) {
    return "A06:2021 - Vulnerable and Outdated Components";
  }
  if (text.includes("password") || text.includes("auth") || text.includes("session") || text.includes("login") || text.includes("jwt") || text.includes("cookie")) {
    return "A07:2021 - Identification and Authentication Failures";
  }
  if (text.includes("integrity") || text.includes("deserialization") || text.includes("ci/cd") || text.includes("pipeline")) {
    return "A08:2021 - Software and Data Integrity Failures";
  }
  if (text.includes("logging") || text.includes("monitoring") || text.includes("audit log")) {
    return "A09:2021 - Security Logging and Monitoring Failures";
  }
  if (text.includes("ssrf") || text.includes("server-side request")) {
    return "A10:2021 - Server-Side Request Forgery (SSRF)";
  }

  return "A05:2021 - Security Misconfiguration";
}
