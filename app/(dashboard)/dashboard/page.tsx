"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SecurityScoreCard, StatCard } from "@/components/dashboard/kpi-card";
import { SeverityChart } from "@/components/dashboard/severity-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { OwaspChart } from "@/components/dashboard/owasp-chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, ScannerBadge } from "@/components/ui/badge";
import { Bug, AlertTriangle, ShieldAlert, CheckCircle2, Radar, ArrowRight, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading Security Intelligence Dashboard...</p>
      </div>
    );
  }

  const score = data?.score?.score ?? 78;
  const tier = data?.score?.tier ?? "Good";
  const openCounts = data?.score?.openCounts ?? { critical: 2, high: 5, medium: 12, low: 10, info: 3, total: 32 };
  const remediationRate = data?.score?.remediationRate ?? 68;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Security Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time normalized security posture analysis from OWASP ZAP, Nmap, Nikto, and Trivy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/scans"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            View All Scans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SecurityScoreCard score={score} tier={tier} />
        <StatCard
          title="Total Open Issues"
          value={data?.openCount ?? openCounts.total}
          subtitle={`${data?.resolvedCount ?? 14} resolved`}
          icon={Bug}
          iconColor="text-rose-400"
        />
        <StatCard
          title="Critical Findings"
          value={openCounts.critical}
          subtitle="Immediate action required"
          icon={ShieldAlert}
          iconColor="text-red-400"
        />
        <StatCard
          title="High Severity"
          value={openCounts.high}
          subtitle="Priority remediation"
          icon={AlertTriangle}
          iconColor="text-orange-400"
        />
        <StatCard
          title="Remediation Rate"
          value={`${remediationRate}%`}
          subtitle="Overall resolution rate"
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SeverityChart counts={openCounts} />
        <TrendChart data={data?.trendData || []} />
        <OwaspChart distribution={data?.owaspDistribution || []} />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Radar className="w-4 h-4 text-indigo-400" /> Recent Security Scans
            </CardTitle>
            <Link href="/scans" className="text-xs font-medium text-indigo-400 hover:underline">
              View All
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
                <tr>
                  <th className="py-2.5 px-3">Scanner</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentScans?.map((scan: any) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <ScannerBadge scanner={scan.scannerType} />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200 truncate max-w-[140px]" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-indigo-400">
                      {scan._count?.vulnerabilities ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Vulnerabilities Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Bug className="w-4 h-4 text-indigo-400" /> Latest Detected Vulnerabilities
            </CardTitle>
            <Link href="/vulnerabilities" className="text-xs font-medium text-indigo-400 hover:underline">
              View All
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentVulns?.map((vuln: any) => (
                  <tr key={vuln.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <SeverityBadge severity={vuln.severity} />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <Link href={`/vulnerabilities/${vuln.id}`} className="hover:text-indigo-400 transition-colors line-clamp-1">
                        {vuln.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">
                      {vuln.asset?.name || "Global"}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={vuln.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-800/60">
        {data?.score?.disclaimer || "SecLens Security Score is an application-defined risk indicator based on weighted open security findings."}
      </p>
    </div>
  );
}
