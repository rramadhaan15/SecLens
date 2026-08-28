# SecLens

> **Security Intelligence, Visualized.**

SecLens is a production-grade cybersecurity analytics and vulnerability management platform designed to import, normalize, analyze, visualize, and track scan results from multiple security tools.

---

## Key Features

- **Multi-Tool Scanner Parsers**: Native normalization for **OWASP ZAP**, **Nmap**, **Nikto**, and **Trivy** (XML and JSON formats).
- **Security Score Engine**: Documented 0–100 posture scoring service based on weighted severity deductions.
- **OWASP Top 10 Analytics**: Automated mapping of findings to the 2021 OWASP Top 10 categories.
- **Scan Posture Delta Comparison**: Compare baseline vs recent scans with resolved/new/unchanged metrics (+15 resolved findings).
- **Remediation Workflow**: Complete vulnerability lifecycle tracking from discovery (`OPEN`) to resolution (`RESOLVED`, `ACCEPTED_RISK`).
- **Executive Security Reports**: Printable PDF report generator for executive stakeholders.
- **Project & Asset Inventory**: Project-aware security monitoring for domains, APIs, container images, and host servers.

---

## Supported Security Scanners

| Scanner | Supported Formats | Auto-Detected |
|---|---|---|
| **OWASP ZAP** | JSON, XML | Yes |
| **Nmap** | XML | Yes |
| **Nikto** | JSON, Text | Yes |
| **Trivy** | JSON | Yes |

---

## Security Score Algorithm

$$\text{Score} = \max\left(0, 100 - \sum \text{Penalties}\right)$$

- **Critical**: -25 points
- **High**: -10 points
- **Medium**: -3 points
- **Low**: -1 point
- **Info**: 0 points

> **Disclaimer**: The SecLens Security Score is an application-defined risk posture indicator based on open findings and is **NOT** an official CVSS score.

---

## Quickstart & Installation

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/seclens/seclens.git
cd seclens

# 2. Start PostgreSQL & SecLens App
docker compose up -d

# 3. Initialize database & seed demo data
docker compose exec seclens npx prisma db push
docker compose exec seclens npx prisma db seed
```

Access the dashboard at `http://localhost:3000`.

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Push Prisma schema & seed demo data
npx prisma db push
npx prisma db seed

# 4. Start Next.js development server
npm run dev
```

---

## Demo Account Credentials

SecLens comes pre-populated with synthetic scan data, projects, and assets.

- **Email**: `demo@seclens.local`
- **Password**: `SecLens2026!Demo`

---

## Automated Verification & Testing

```bash
# Run unit tests (Parsers & Security Score engine)
npm run test

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## Roadmap

- [x] Project Foundation & NextAuth Auth
- [x] Scanner Parser Engine (ZAP, Nmap, Nikto, Trivy)
- [x] Security Score Engine
- [x] OWASP Top 10 Mappings
- [x] Scan Posture Comparison View
- [x] Remediation Lifecycle Tracking
- [x] PDF Executive Report Generation
- [x] Docker & CI/CD Workflows
- [ ] Slack & Discord Webhook Alerts
- [ ] Role-Based Access Control (RBAC)
- [ ] Jira / GitHub Issues Integration

---

## License

Distributed under the MIT License. See `LICENSE` for details.
