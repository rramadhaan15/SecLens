"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, ScannerBadge } from "@/components/ui/badge";
import { FolderKanban, Server, Radar, Bug, ArrowLeft, Shield } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetail();
  }, [id]);

  if (loading) return <p className="text-xs text-slate-400">Loading project details...</p>;
  if (!project) return <p className="text-xs text-red-400">Project not found.</p>;

  return (
    <div className="space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
            {project.environment}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">{project.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{project.description || "No description provided."}</p>
        </div>
        <div className="flex gap-4 text-center border-l border-slate-800 pl-6">
          <div>
            <span className="text-2xl font-bold text-white block">{project._count?.assets ?? 0}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Assets</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-indigo-400 block">{project._count?.scans ?? 0}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Scans</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-400 block">{project._count?.vulnerabilities ?? 0}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Vulnerabilities</span>
          </div>
        </div>
      </div>

      {/* Assets & Scans Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Server className="w-4 h-4 text-indigo-400" /> Monitored Assets
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {project.assets?.map((asset: any) => (
              <div key={asset.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{asset.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{asset.target}</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  {asset.riskLevel} RISK
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Scans List */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Radar className="w-4 h-4 text-indigo-400" /> Recent Scans
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {project.scans?.map((scan: any) => (
              <div key={scan.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ScannerBadge scanner={scan.scannerType} />
                    <span className="text-xs font-medium text-slate-200">{scan.target}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(scan.createdAt).toLocaleString()}</p>
                </div>
                <Link
                  href={`/scans/${scan.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  View Scan
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Vulnerabilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bug className="w-4 h-4 text-indigo-400" /> Open Project Vulnerabilities
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">OWASP Category</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {project.vulnerabilities?.map((vuln: any) => (
                <tr key={vuln.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <SeverityBadge severity={vuln.severity} />
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    <Link href={`/vulnerabilities/${vuln.id}`} className="hover:text-indigo-400 transition-colors">
                      {vuln.title}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {vuln.owaspCategory || "N/A"}
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
