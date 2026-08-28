# SecLens REST API Reference

All protected endpoints require authenticated session cookies or JWT headers.

## Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Fetch project details
- `DELETE /api/projects/:id` - Delete project

### Scans & Upload
- `GET /api/scans` - List imported scans
- `POST /api/scans/upload` - Upload and parse scan report file (ZAP, Nmap, Nikto, Trivy)
- `GET /api/scans/:id` - Fetch scan details and findings
- `DELETE /api/scans/:id` - Delete scan entry

### Vulnerabilities
- `GET /api/vulnerabilities` - Search, filter (severity, status, scanner, owasp), and paginate findings
- `GET /api/vulnerabilities/:id` - Fetch vulnerability details
- `PATCH /api/vulnerabilities/:id` - Update status, note, or assigned user

### Assets
- `GET /api/assets` - List monitored assets
- `POST /api/assets` - Register asset

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Generate executive security report
