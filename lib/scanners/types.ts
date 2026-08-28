export type ScannerType = "OWASP_ZAP" | "NMAP" | "NIKTO" | "TRIVY";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface NormalizedVulnerability {
  title: string;
  description?: string;
  severity: Severity;
  cvssScore?: number;
  cveId?: string;
  cweId?: string;
  owaspCategory?: string;
  asset?: string;
  scanner: ScannerType;
  evidence?: string;
  remediation?: string;
}

export interface ParseResult {
  scannerType: ScannerType;
  target?: string;
  vulnerabilities: NormalizedVulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
}

export interface ScannerParser {
  scannerType: ScannerType;
  canParse(input: string | Record<string, unknown>): boolean;
  parse(input: string | Record<string, unknown>): ParseResult;
}
