"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

export default function RemediationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRemediation() {
      try {
        const res = await fetch("/api/remediation");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRemediation();
  }, []);

  if (loading) return <p className="text-xs text-slate-400">Loading remediation workflow tracking...</p>;

  const metrics = data?.metrics || { open: 12, inProgress: 4, resolved: 14, acceptedRisk: 2, total: 32 };
  const vulns = data?.vulnerabilities || [];
  const activities = data?.activities || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-400" /> Remediation Tracking Workflow
        </h1>
        <p className="text-xs text-slate-400 mt-1">Track security findings from initial discovery to patch verification</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-rose-800/40 bg-rose-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-rose-400 block mb-1">Open Issues</span>
          <span className="text-3xl font-extrabold text-rose-400 block">{metrics.open}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting assignment</span>
        </Card>
        <Card className="p-5 border-sky-800/40 bg-sky-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-sky-400 block mb-1">In Progress</span>
          <span className="text-3xl font-extrabold text-sky-400 block">{metrics.inProgress}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Active patching</span>
        </Card>
        <Card className="p-5 border-emerald-800/40 bg-emerald-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-emerald-400 block mb-1">Resolved</span>
          <span className="text-3xl font-extrabold text-emerald-400 block">{metrics.resolved}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified fixed</span>
        </Card>
        <Card className="p-5 border-purple-800/40 bg-purple-950/20 text-center">
          <span className="text-xs font-semibold uppercase text-purple-400 block mb-1">Accepted Risk</span>
          <span className="text-3xl font-extrabold text-purple-400 block">{metrics.acceptedRisk}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Documented exceptions</span>
        </Card>
      </div>

      {/* Workflow Board and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Remediation Queue</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {vulns.map((v: any) => (
                <div key={v.id} className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={v.severity} />
                      <StatusBadge status={v.status} />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{v.title}</h4>
                    <p className="text-[10px] text-slate-400">{v.project?.name || "Global"} · {v.asset?.name || "N/A"}</p>
                  </div>
                  <Link
                    href={`/vulnerabilities/${v.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
                  >
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="w-4 h-4 text-indigo-400" /> Remediation Activity Feed
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500">No activity recorded yet.</p>
              ) : (
                activities.map((act: any) => (
                  <div key={act.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-semibold">{act.user?.name || "Security Lead"}</span>
                      <span className="text-[10px] text-slate-500">{new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-indigo-300 font-medium">{act.vulnerability?.title}</p>
                    <p className="text-[10px] text-slate-400">{act.note}</p>
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
