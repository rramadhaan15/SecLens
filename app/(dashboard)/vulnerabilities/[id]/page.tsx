"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, ScannerBadge } from "@/components/ui/badge";
import { Bug, ArrowLeft, Shield, ExternalLink, Wrench, Clock, CheckCircle2 } from "lucide-react";

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [vuln, setVuln] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/vulnerabilities/${id}`);
      const data = await res.json();
      setVuln(data);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/vulnerabilities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remediationNote: note }),
      });
      if (res.ok) {
        setNote("");
        fetchDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <p className="text-xs text-slate-400">Loading vulnerability details...</p>;
  if (!vuln) return <p className="text-xs text-red-400">Vulnerability not found.</p>;

  return (
    <div className="space-y-6">
      <Link href="/vulnerabilities" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Vulnerabilities
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={vuln.severity} />
            <ScannerBadge scanner={vuln.scanner} />
            <StatusBadge status={vuln.status} />
          </div>
          <h1 className="text-xl font-bold text-white">{vuln.title}</h1>
          <p className="text-xs text-slate-400 mt-1">Project: {vuln.project?.name || "Global"} · Asset: {vuln.asset?.name || "N/A"}</p>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Technical Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Shield className="w-4 h-4 text-indigo-400" /> Security Risk Metadata
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">CVSS Score</span>
                <span className="text-base font-extrabold text-rose-400">{vuln.cvssScore ? `${vuln.cvssScore} / 10.0` : "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">CVE Identifier</span>
                <span className="text-xs font-mono font-bold text-indigo-400">{vuln.cveId || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">CWE ID</span>
                <span className="text-xs font-mono font-bold text-slate-200">{vuln.cweId || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">OWASP Mapping</span>
                <span className="text-xs font-semibold text-amber-400 truncate block">{vuln.owaspCategory || "N/A"}</span>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Description</CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {vuln.description || "No description available."}
            </p>
          </Card>

          {/* Evidence */}
          {vuln.evidence && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Evidence / Proof of Concept</CardTitle>
              </CardHeader>
              <pre className="bg-slate-950 p-4 rounded-lg text-[11px] font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                {vuln.evidence}
              </pre>
            </Card>
          )}

          {/* Remediation Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Remediation</CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              {vuln.remediation || "Apply vendor security updates and validate input parameters."}
            </p>
          </Card>
        </div>

        {/* Right Col: Remediation Workflow Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Wrench className="w-4 h-4 text-indigo-400" /> Remediation Workflow
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ACCEPTED_RISK">Accepted Risk</option>
                  <option value="FALSE_POSITIVE">False Positive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Remediation Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about code patch, PR link, or mitigation strategy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white h-24"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                {isUpdating ? "Updating..." : "Update Workflow Status"}
              </button>
            </form>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="w-4 h-4 text-indigo-400" /> Workflow Activity Log
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {vuln.remediationActivities?.length === 0 ? (
                <p className="text-xs text-slate-500">No status changes recorded yet.</p>
              ) : (
                vuln.remediationActivities?.map((act: any) => (
                  <div key={act.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-semibold">{act.user?.name || "Security Lead"}</span>
                      <span className="text-[10px] text-slate-500">{new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{act.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
