"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Plus, Download, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SeverityBadge } from "@/components/ui/badge";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resR, resP] = await Promise.all([fetch("/api/reports"), fetch("/api/projects")]);
      const dataR = await resR.json();
      const dataP = await resP.json();
      setReports(dataR || []);
      setProjects(dataP || []);
      if (dataP.length > 0) setSelectedProjectId(dataP[0].id);
      if (dataR.length > 0) setSelectedReport(dataR[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, title: reportTitle }),
      });
      if (res.ok) {
        setReportTitle("");
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = selectedReport ? JSON.parse(selectedReport.summaryJson) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" /> Executive Security Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">Generate and export comprehensive security posture reports for stakeholders</p>
        </div>
        {selectedReport && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        )}
      </div>

      {/* Generator & List Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Q3 Executive Security Audit"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
            >
              Generate Executive Report
            </button>
          </form>
        </Card>

        {/* History List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Report History ({reports.length})</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedReport?.id === r.id
                      ? "bg-indigo-950/40 border-indigo-500/50"
                      : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Project: {r.project?.name} · Created: {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400">Preview &rarr;</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Printable Report Document Preview */}
      {selectedReport && summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-slate-100 max-w-4xl mx-auto print:bg-white print:text-black print:p-0 print:shadow-none print:border-none">
          {/* Report Document Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 print:border-black">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 print:text-black block mb-1">
                SecLens Executive Security Report
              </span>
              <h2 className="text-2xl font-extrabold text-white print:text-black">{summary.projectName}</h2>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">Environment: {summary.environment} · Generated: {new Date(summary.generatedAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Security Score</span>
              <span className="text-4xl font-extrabold text-indigo-400 print:text-indigo-700">{summary.score} / 100</span>
              <span className="block text-xs font-bold text-emerald-400 print:text-emerald-700 mt-0.5">{summary.tier}</span>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-100">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Assets</span>
              <span className="text-lg font-bold text-white print:text-black">{summary.totalAssets}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-100">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Scans Run</span>
              <span className="text-lg font-bold text-indigo-400 print:text-black">{summary.totalScans}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-100">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Critical Issues</span>
              <span className="text-lg font-bold text-red-400 print:text-red-700">{summary.openCounts.critical}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-100">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">High Issues</span>
              <span className="text-lg font-bold text-orange-400 print:text-orange-700">{summary.openCounts.high}</span>
            </div>
          </div>

          {/* Top Vulnerabilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
              Top Priority Security Findings
            </h3>
            {summary.topVulnerabilities.map((v: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 print:bg-gray-50 print:border-gray-300 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 print:text-black">{v.title}</span>
                  <SeverityBadge severity={v.severity} />
                </div>
                <p className="text-[11px] text-slate-400 print:text-gray-600">CVE: {v.cveId || "N/A"} · OWASP: {v.owaspCategory}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
              Strategic Recommendations & Action Items
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-300 print:text-gray-800 space-y-1">
              {summary.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
