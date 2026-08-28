# Scanner Parsers Architecture

SecLens supports extensible scanner parsers. Each parser conforms to:

```typescript
export interface ScannerParser {
  scannerType: ScannerType;
  canParse(input: string | Record<string, unknown>): boolean;
  parse(input: string | Record<string, unknown>): ParseResult;
}
```

## Supported Tool Specs

| Scanner | Supported Formats | Extracted Metadata |
|---|---|---|
| **OWASP ZAP** | JSON, XML | Alert name, Risk code (0-3), CWE, WSTG tags, Solution, Evidence |
| **Nmap** | XML | Target IP/host, Open ports, Service versions, NSE script outputs |
| **Nikto** | JSON, Text | Target URI, OSVDB IDs, HTTP method, Vulnerability messages |
| **Trivy** | JSON | Container image, Package name, Installed/Fixed versions, CVE ID, CVSS Score |
