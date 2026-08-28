import { NormalizedVulnerability, ParseResult, ScannerParser, Severity } from "../types";
import { mapToOwaspCategory } from "../../owasp/owasp-mapper";

export class NmapParser implements ScannerParser {
  public scannerType = "NMAP" as const;

  public canParse(input: string | Record<string, unknown>): boolean {
    if (typeof input === "string") {
      return input.includes("<nmaprun") || input.includes("nmaprun") || input.includes("Nmap scan report");
    }
    if (typeof input === "object" && input !== null) {
      return "nmaprun" in input;
    }
    return false;
  }

  public parse(input: string | Record<string, unknown>): ParseResult {
    const vulnerabilities: NormalizedVulnerability[] = [];
    let target = "Nmap Network Target";

    const content = typeof input === "string" ? input : JSON.stringify(input);

    // Extract target address if present
    const addrMatch = content.match(/addr="([^"]+)"/) || content.match(/Nmap scan report for ([^\s\n]+)/);
    if (addrMatch) {
      target = addrMatch[1];
    }

    // Extract open ports and scripts
    const portRegex = /<port\s+protocol="([^"]+)"\s+portid="([^"]+)">(.*?)(<\/port>)/gs;
    let match;

    while ((match = portRegex.exec(content)) !== null) {
      const protocol = match[1];
      const portId = match[2];
      const portBody = match[3];

      if (portBody.includes('state="open"') || portBody.includes("state='open'")) {
        const serviceMatch = portBody.match(/<service\s+name="([^"]+)"(?:\s+product="([^"]+)")?(?:\s+version="([^"]+)")?/);
        const serviceName = serviceMatch ? serviceMatch[1] : "unknown";
        const product = serviceMatch && serviceMatch[2] ? serviceMatch[2] : "";
        const version = serviceMatch && serviceMatch[3] ? serviceMatch[3] : "";

        // Check for NSE script output
        const scriptMatch = portBody.match(/<script\s+id="([^"]+)"\s+output="([^"]+)"/);
        
        let title = `Open Port ${portId}/${protocol.toUpperCase()} (${serviceName})`;
        let description = `Port ${portId} is open running ${serviceName} ${product} ${version}`.trim();
        let severity: Severity = "INFO";

        if (scriptMatch) {
          const scriptId = scriptMatch[1];
          const output = scriptMatch[2];
          title = `NSE Alert [${scriptId}]: ${title}`;
          description += `\nScript Output: ${output}`;
          severity = output.toLowerCase().includes("vulnerable") ? "HIGH" : "MEDIUM";
        } else if (["21", "23", "445", "3389", "1433", "3306"].includes(portId)) {
          // Sensitive management/database ports open
          severity = "MEDIUM";
          description += `. Exposing sensitive port ${portId} to the network without restricted ACLs is risky.`;
        }

        vulnerabilities.push({
          title,
          description,
          severity,
          cweId: "CWE-200",
          owaspCategory: mapToOwaspCategory(title, "CWE-200", description),
          asset: target,
          scanner: "NMAP",
          remediation: `Restrict access to port ${portId} using network firewalls or disable unused service.`,
        });
      }
    }

    // Fallback if no port regex matched but text contains scan output
    if (vulnerabilities.length === 0 && content.includes("open")) {
      vulnerabilities.push({
        title: `Open Network Services Detected`,
        description: `Nmap detected open network services on ${target}.`,
        severity: "LOW",
        owaspCategory: "A05:2021 - Security Misconfiguration",
        asset: target,
        scanner: "NMAP",
      });
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
      scannerType: "NMAP",
      target,
      vulnerabilities,
      summary,
    };
  }
}
