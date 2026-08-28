"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScannerBadge } from "@/components/ui/badge";
import { Radar, UploadCloud, GitCompare, ArrowRight, Trash2 } from "lucide-react";

export default function ScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scans");
      const data = await res.json();
      setScans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan and its findings?")) return;
    try {
      await fetch(`/api/scans/${id}`, { method: "DELETE" });
      fetchScans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radar className="w-5 h-5 text-indigo-400" /> Scan Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Import, inspect, and compare vulnerability scan reports from ZAP, Nmap, Nikto, and Trivy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scans/compare"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <GitCompare className="w-4 h-4 text-indigo-400" /> Compare Scans
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading scans...</p>
      ) : scans.length === 0 ? (
        <Card className="text-center py-12">
          <Radar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No scans imported yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Click "Import Scan" in the header to parse your security tool results.</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Security Scan History ({scans.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Scanner</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Scan Date</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <ScannerBadge scanner={scan.scannerType} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {scan.target}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {scan.project?.name || "Global"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-400">
                      {scan._count?.vulnerabilities ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-3">
                      <Link
                        href={`/scans/${scan.id}`}
                        className="text-xs font-semibold text-indigo-400 hover:underline"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleDelete(scan.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Scan"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
