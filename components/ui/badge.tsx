import React from "react";
import { Severity, VulnStatus, ScannerType } from "@prisma/client";

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
}

export function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
  const sev = String(severity).toUpperCase();
  let styles = "bg-slate-800 text-slate-300 border-slate-700";

  switch (sev) {
    case "CRITICAL":
      styles = "bg-red-950/80 text-red-400 border-red-800/60 shadow-sm shadow-red-950/40";
      break;
    case "HIGH":
      styles = "bg-orange-950/80 text-orange-400 border-orange-800/60";
      break;
    case "MEDIUM":
      styles = "bg-amber-950/80 text-amber-400 border-amber-800/60";
      break;
    case "LOW":
      styles = "bg-blue-950/80 text-blue-400 border-blue-800/60";
      break;
    case "INFO":
      styles = "bg-slate-900 text-slate-400 border-slate-800";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {sev}
    </span>
  );
}

interface StatusBadgeProps {
  status: VulnStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const st = String(status).toUpperCase();
  let styles = "bg-slate-800 text-slate-300 border-slate-700";

  switch (st) {
    case "OPEN":
      styles = "bg-rose-950/50 text-rose-300 border-rose-800/40";
      break;
    case "IN_PROGRESS":
      styles = "bg-sky-950/50 text-sky-300 border-sky-800/40";
      break;
    case "RESOLVED":
      styles = "bg-emerald-950/50 text-emerald-300 border-emerald-800/40";
      break;
    case "ACCEPTED_RISK":
      styles = "bg-purple-950/50 text-purple-300 border-purple-800/40";
      break;
    case "FALSE_POSITIVE":
      styles = "bg-slate-900 text-slate-400 border-slate-800";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles}`}>
      {st.replace("_", " ")}
    </span>
  );
}

interface ScannerBadgeProps {
  scanner: ScannerType | string;
}

export function ScannerBadge({ scanner }: ScannerBadgeProps) {
  const sc = String(scanner).toUpperCase();
  let label = sc;
  let color = "text-indigo-400 bg-indigo-950/40 border-indigo-800/40";

  if (sc === "OWASP_ZAP") {
    label = "OWASP ZAP";
    color = "text-blue-400 bg-blue-950/40 border-blue-800/40";
  } else if (sc === "NMAP") {
    label = "Nmap";
    color = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
  } else if (sc === "NIKTO") {
    label = "Nikto";
    color = "text-amber-400 bg-amber-950/40 border-amber-800/40";
  } else if (sc === "TRIVY") {
    label = "Trivy";
    color = "text-cyan-400 bg-cyan-950/40 border-cyan-800/40";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}
