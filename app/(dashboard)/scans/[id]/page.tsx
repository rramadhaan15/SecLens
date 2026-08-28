"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, ScannerBadge } from "@/components/ui/badge";
import { Radar, ArrowLeft, GitCompare, Bug, Clock, CheckCircle } from "lucide-react";

export default function ScanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScan() {
      try {
        const res = await fetch(`/api/scans/${id}`);
        const data = await res.json();
        setScan(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchScan();
  }, [id]);

  if (loading) return <p className="text-xs text-slate-400">Loading scan details...</p>;
  if (!scan) return <p className="text-xs text-red-400">Scan not found.</p>;

  return (
    <div className="space-y-6">
      <Link href="/scans" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Scans
      </Link>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScannerBadge scanner={scan.scannerType} />
            <span className="text-xs text-slate-400 font-mono">Target: {scan.target}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Scan Execution Report</h1>
          <p className="text-xs text-slate-400 mt-1">{scan.summary || "Scan analysis completed."}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/scans/compare"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <GitCompare className="w-4 h-4" /> Compare with Previous Scan
          </Link>
        </div>
      </div>

      {/* Meta Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
            <CheckCircle className="w-4 h-4" /> {scan.status}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
          <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-1">
            <Clock className="w-4 h-4 text-indigo-400" /> {((scan.durationMs || 10000) / 1000).toFixed(1)}s
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scan Date</span>
          <span className="text-xs font-bold text-slate-300 mt-1 block">
            {new Date(scan.createdAt).toLocaleDateString()}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Findings</span>
          <span className="text-sm font-bold text-indigo-400 mt-1 block">
            {scan.vulnerabilities?.length ?? 0}
          </span>
        </Card>
      </div>

      {/* Scan Findings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bug className="w-4 h-4 text-indigo-400" /> Normalized Scan Findings ({scan.vulnerabilities?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">CVE / CWE</th>
                <th className="py-2.5 px-3">OWASP Mapping</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scan.vulnerabilities?.map((vuln: any) => (
                <tr key={vuln.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <SeverityBadge severity={vuln.severity} />
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    <Link href={`/vulnerabilities/${vuln.id}`} className="hover:text-indigo-400 transition-colors">
                      {vuln.title}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {vuln.cveId || vuln.cweId || "N/A"}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {vuln.owaspCategory || "Unclassified"}
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
  );
}
