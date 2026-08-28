"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, ScannerBadge } from "@/components/ui/badge";
import { GitCompare, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";

export default function ScanComparePage() {
  const [scanA, setScanA] = useState("Scan #1 (OWASP ZAP - 30 days ago)");
  const [scanB, setScanB] = useState("Scan #2 (OWASP ZAP - Recent)");

  const comparisonData = {
    previousTotal: 47,
    currentTotal: 32,
    resolvedCount: 15,
    newCount: 3,
    unchangedCount: 29,
    resolvedItems: [
      { id: "1", title: "Missing Anti-Clickjacking Header (X-Frame-Options)", severity: "MEDIUM", scanner: "OWASP_ZAP" },
      { id: "2", title: "Hardcoded Cryptographic Secret in Container Layer", severity: "HIGH", scanner: "TRIVY" },
      { id: "3", title: "Server Banner Information Disclosure", severity: "LOW", scanner: "NIKTO" },
    ],
    newItems: [
      { id: "4", title: "Cross-Site Scripting (Reflected XSS) in Search Endpoint", severity: "HIGH", scanner: "OWASP_ZAP" },
      { id: "5", title: "Open Sensitive Management Port 3389/TCP (RDP)", severity: "HIGH", scanner: "NMAP" },
    ],
  };

  return (
    <div className="space-y-6">
      <Link href="/scans" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Scans
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" /> Scan Posture Delta Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1">Compare vulnerability findings delta between baseline and current security scans</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1">Baseline Scan (Before)</label>
          <select
            value={scanA}
            onChange={(e) => setScanA(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
          >
            <option>Scan #1 (OWASP ZAP - 30 days ago)</option>
            <option>Scan #2 (Nmap Scan - 15 days ago)</option>
          </select>
        </Card>
        <Card className="p-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1">Target Scan (After)</label>
          <select
            value={scanB}
            onChange={(e) => setScanB(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
          >
            <option>Scan #2 (OWASP ZAP - Recent)</option>
            <option>Scan #3 (Trivy Container Scan - Today)</option>
          </select>
        </Card>
      </div>

      {/* Comparison KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-emerald-800/40 bg-emerald-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-emerald-400 block mb-1">Resolved Findings</span>
          <span className="text-3xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-6 h-6" /> +{comparisonData.resolvedCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully remediated</span>
        </Card>

        <Card className="p-5 border-rose-800/40 bg-rose-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-rose-400 block mb-1">New Findings</span>
          <span className="text-3xl font-extrabold text-rose-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-6 h-6" /> {comparisonData.newCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Introduced since baseline</span>
        </Card>

        <Card className="p-5 text-center">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Unchanged Issues</span>
          <span className="text-3xl font-extrabold text-slate-200 block">{comparisonData.unchangedCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending resolution</span>
        </Card>

        <Card className="p-5 border-indigo-800/40 bg-indigo-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-indigo-300 block mb-1">Net Improvement</span>
          <span className="text-3xl font-extrabold text-indigo-400 flex items-center justify-center gap-1">
            <TrendingDown className="w-6 h-6" /> -12 Vulns
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Overall reduction</span>
        </Card>
      </div>

      {/* Lists of Resolved vs New Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Resolved Findings (+{comparisonData.resolvedCount})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {comparisonData.resolvedItems.map((item) => (
              <div key={item.id} className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={item.severity} />
                    <ScannerBadge scanner={item.scanner} />
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">RESOLVED</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Newly Detected Findings ({comparisonData.newCount})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {comparisonData.newItems.map((item) => (
              <div key={item.id} className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={item.severity} />
                    <ScannerBadge scanner={item.scanner} />
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400">NEW</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
