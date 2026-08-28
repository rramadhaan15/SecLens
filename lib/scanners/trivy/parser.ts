import { NormalizedVulnerability, ParseResult, ScannerParser, Severity } from "../types";
import { mapToOwaspCategory } from "../../owasp/owasp-mapper";

export class TrivyParser implements ScannerParser {
  public scannerType = "TRIVY" as const;

  public canParse(input: string | Record<string, unknown>): boolean {
    if (typeof input === "object" && input !== null) {
      const obj = input as Record<string, unknown>;
      return "SchemaVersion" in obj || "ArtifactName" in obj || ("Results" in obj && Array.isArray(obj.Results));
    }
    if (typeof input === "string") {
      return input.includes("VulnerabilityID") || (input.includes('"SchemaVersion"') && input.includes('"Results"'));
    }
    return false;
  }

  public parse(input: string | Record<string, unknown>): ParseResult {
    const vulnerabilities: NormalizedVulnerability[] = [];
    let target = "Trivy Container / Repository Target";

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

    if (data.ArtifactName || data.Target) {
      target = String(data.ArtifactName || data.Target);
    }

    const results = Array.isArray(data.Results) ? data.Results : [];

    for (const res of results) {
      const resTarget = res.Target || target;
      const vulns = Array.isArray(res.Vulnerabilities) ? res.Vulnerabilities : [];

      for (const item of vulns) {
        const cveId = item.VulnerabilityID || undefined;
        const title = item.Title || item.VulnerabilityID || "Trivy Vulnerability";
        const pkgName = item.PkgName ? `${item.PkgName} (${item.InstalledVersion || "unknown"})` : "";
        const description = item.Description || item.Title || `Vulnerability detected in ${pkgName}`;
        const severity = this.normalizeSeverity(item.Severity);
        const cvssScore = item.CVSS?.nvd?.V3Score || item.CVSS?.redhat?.V3Score || undefined;
        const remediation = item.FixedVersion
          ? `Upgrade ${item.PkgName || "package"} to version ${item.FixedVersion} or higher.`
          : "Apply vendor updates when available.";

        vulnerabilities.push({
          title: `${title}${pkgName ? ` in ${pkgName}` : ""}`,
          description,
          severity,
          cvssScore,
          cveId,
          cweId: item.CweIDs && item.CweIDs.length > 0 ? item.CweIDs[0] : "CWE-937",
          owaspCategory: mapToOwaspCategory(title, item.CweIDs?.[0], description),
          asset: String(resTarget),
          scanner: "TRIVY",
          evidence: item.PrimaryURL ? `Reference: ${item.PrimaryURL}` : undefined,
          remediation,
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
      scannerType: "TRIVY",
      target,
      vulnerabilities,
      summary,
    };
  }

  private normalizeSeverity(sev?: string): Severity {
    if (!sev) return "MEDIUM";
    const s = sev.toUpperCase();
    if (s === "CRITICAL") return "CRITICAL";
    if (s === "HIGH") return "HIGH";
    if (s === "MEDIUM") return "MEDIUM";
    if (s === "LOW") return "LOW";
    return "INFO";
  }
}
