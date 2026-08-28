# SecLens Architecture Documentation

## System Overview

SecLens is an open-source cybersecurity analytics and vulnerability management platform designed to consolidate, normalize, visualize, and track findings from multiple security tools.

```
[OWASP ZAP] \
[Nmap]       -->  [Scanner Registry & Parsers] --> [Normalized Model] --> [Prisma ORM / PostgreSQL]
[Nikto]      /                                                                       |
[Trivy]     /                                                                        v
                                                                   [Security Score Engine]
                                                                             |
                                                                             v
                                                                 [Dashboard UI / Recharts]
```

## Key Modules

### 1. Scanner Parser Engine (`lib/scanners/`)
Implements a modular `ScannerParser` interface for each security tool. The parser auto-detects scanner report formats (XML/JSON) and normalizes output into a unified `NormalizedVulnerability` schema.

### 2. Security Score Engine (`lib/scoring/security-score.ts`)
Calculates a 0-100 posture risk score based on weighted deductions per open severity finding and remediation recovery rates.

### 3. Database Layer (`prisma/schema.prisma`)
Relational model with explicit foreign key constraints across Users, Projects, Assets, Scans, Vulnerabilities, Remediation Activities, Audit Logs, and Reports.
