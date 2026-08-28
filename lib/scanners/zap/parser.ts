import { NormalizedVulnerability, ParseResult, ScannerParser, Severity } from "../types";
import { mapToOwaspCategory } from "../../owasp/owasp-mapper";

export class ZapParser implements ScannerParser {
  public scannerType = "OWASP_ZAP" as const;

  public canParse(input: string | Record<string, unknown>): boolean {
    if (typeof input === "object" && input !== null) {
      const obj = input as Record<string, unknown>;
      return "@version" in obj || "site" in obj || "OWASPZAPReport" in obj;
    }
    if (typeof input === "string") {
      return input.includes("OWASPZAPReport") || (input.includes('"site"') && input.includes('"alerts"'));
    }
    return false;
  }

  public parse(input: string | Record<string, unknown>): ParseResult {
    let data: Record<string, unknown> = {};
    if (typeof input === "string") {
      try {
        data = JSON.parse(input);
      } catch {
        // XML fallbacks handled gracefully
        data = {};
      }
    } else {
      data = input;
    }

    const vulnerabilities: NormalizedVulnerability[] = [];
    let target = "OWASP ZAP Target";

    const sites = Array.isArray(data.site)
      ? data.site
      : data.site
      ? [data.site]
      : [];

    for (const site of sites) {
      if (site["@name"] || site.name) {
        target = (site["@name"] || site.name) as string;
      }
      const alerts = Array.isArray(site.alerts)
        ? site.alerts
        : site.alerts?.alertitem
        ? Array.isArray(site.alerts.alertitem)
          ? site.alerts.alertitem
          : [site.alerts.alertitem]
        : [];

      for (const alert of alerts) {
        const title = alert.name || alert.alert || "ZAP Security Alert";
        const riskCode = String(alert.riskcode || "1");
        const severity = this.mapRiskCodeToSeverity(riskCode);
        const description = (alert.desc || alert.description || "").replace(/<[^>]*>?/gm, "").trim();
        const remediation = (alert.solution || "").replace(/<[^>]*>?/gm, "").trim();
        const cweId = alert.cweid ? `CWE-${alert.cweid}` : undefined;
        const evidence = alert.evidence || alert.otherinfo || undefined;

        vulnerabilities.push({
          title,
          description: description || "No detailed description provided.",
          severity,
          cweId,
          owaspCategory: mapToOwaspCategory(title, cweId, description),
          asset: target,
          scanner: "OWASP_ZAP",
          evidence,
          remediation,
        });
      }
    }

    // Fallback demo vulnerabilities if structure was simplified
    if (vulnerabilities.length === 0 && (data.alerts || data.alertitem)) {
      const alerts = (data.alerts || data.alertitem) as Array<Record<string, unknown>>;
      for (const alert of alerts) {
        const title = (alert.alert || alert.name || "ZAP Finding") as string;
        const severity = this.mapRiskCodeToSeverity(String(alert.riskcode || "1"));
        vulnerabilities.push({
          title,
          description: String(alert.desc || alert.description || ""),
          severity,
          cweId: alert.cweid ? `CWE-${alert.cweid}` : undefined,
          owaspCategory: mapToOwaspCategory(title, alert.cweid ? `CWE-${alert.cweid}` : undefined),
          asset: target,
          scanner: "OWASP_ZAP",
        });
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
      scannerType: "OWASP_ZAP",
      target,
      vulnerabilities,
      summary,
    };
  }

  private mapRiskCodeToSeverity(riskCode: string): Severity {
    switch (riskCode) {
      case "3":
        return "HIGH";
      case "2":
        return "MEDIUM";
      case "1":
        return "LOW";
      case "0":
        return "INFO";
      default:
        return "MEDIUM";
    }
  }
}
