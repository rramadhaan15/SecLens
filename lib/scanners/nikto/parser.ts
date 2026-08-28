import { NormalizedVulnerability, ParseResult, ScannerParser, Severity } from "../types";
import { mapToOwaspCategory } from "../../owasp/owasp-mapper";

export class NiktoParser implements ScannerParser {
  public scannerType = "NIKTO" as const;

  public canParse(input: string | Record<string, unknown>): boolean {
    if (typeof input === "object" && input !== null) {
      const obj = input as Record<string, unknown>;
      return "niktoscan" in obj || ("host" in obj && "vulnerabilities" in obj);
    }
    if (typeof input === "string") {
      return input.includes("Nikto") || input.includes("nikto") || input.includes('"OSVDB"');
    }
    return false;
  }

  public parse(input: string | Record<string, unknown>): ParseResult {
    const vulnerabilities: NormalizedVulnerability[] = [];
    let target = "Nikto Web Target";

    let data: Record<string, unknown> = {};
    if (typeof input === "string") {
      try {
        data = JSON.parse(input);
      } catch {
        data = {};
      }
    } else {
      data = input;
    }

    if (data.host) target = `${data.host}:${data.port || "80"}`;

    const items = Array.isArray(data.vulnerabilities)
      ? data.vulnerabilities
      : Array.isArray(data.items)
      ? data.items
      : [];

    for (const item of items) {
      const msg = item.msg || item.message || item.description || "Nikto Web Finding";
      const title = this.extractTitle(msg);
      const severity = this.calculateSeverity(msg);
      const url = item.url || item.uri || "";

      vulnerabilities.push({
        title,
        description: `${msg} (URI: ${url})`.trim(),
        severity,
        cweId: "CWE-16",
        owaspCategory: mapToOwaspCategory(title, "CWE-16", msg),
        asset: target,
        scanner: "NIKTO",
        evidence: item.method ? `HTTP Method: ${item.method} on ${url}` : undefined,
        remediation: "Review web server configuration and apply recommended security headers and patches.",
      });
    }

    // Fallback if raw text format
    if (vulnerabilities.length === 0 && typeof input === "string" && input.includes("+ ")) {
      const lines = input.split("\n");
      for (const line of lines) {
        if (line.startsWith("+ ")) {
          const msg = line.substring(2).trim();
          const title = this.extractTitle(msg);
          const severity = this.calculateSeverity(msg);
          vulnerabilities.push({
            title,
            description: msg,
            severity,
            owaspCategory: mapToOwaspCategory(title, undefined, msg),
            asset: target,
            scanner: "NIKTO",
          });
        }
      }
    }

    const summary = {
      critical: vulnerabilities.filter((v) => v.severity === "CRITICAL").length,
      high: vulnerabilities.filter((v) => v.severity === "HIGH").length,
      medium: vulnerabilities.filter((v) => v.severity === "MEDIUM").length,
      low: vulnerabilities.filter((v) => v.severity === "LOW").length,
      info: vulnerabilities.filter((v) => v.severity === "INFO").length,
      total: vulnerabilities.length,
    };

    return {
      scannerType: "NIKTO",
      target,
      vulnerabilities,
      summary,
    };
  }

  private extractTitle(msg: string): string {
    if (msg.includes("X-Frame-Options")) return "Missing Anti-Clickjacking Header (X-Frame-Options)";
    if (msg.includes("X-Content-Type-Options")) return "Missing MIME-Sniffing Prevention Header";
    if (msg.includes("Server leaks")) return "Server Banner Information Disclosure";
    if (msg.includes("retrieved")) return "Sensitive Resource Exposed";
    return msg.length > 60 ? msg.substring(0, 60) + "..." : msg;
  }

  private calculateSeverity(msg: string): Severity {
    const text = msg.toLowerCase();
    if (text.includes("sql") || text.includes("overflow") || text.includes("rce") || text.includes("critical")) return "HIGH";
    if (text.includes("xss") || text.includes("traversal") || text.includes("vulnerable")) return "MEDIUM";
    if (text.includes("header") || text.includes("banner") || text.includes("options")) return "LOW";
    return "INFO";
  }
}
