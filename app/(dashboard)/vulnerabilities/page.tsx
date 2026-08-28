"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, ScannerBadge } from "@/components/ui/badge";
import { Bug, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [scanner, setScanner] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(search && { search }),
        ...(severity && { severity }),
        ...(status && { status }),
        ...(scanner && { scanner }),
      });

      const res = await fetch(`/api/vulnerabilities?${query.toString()}`);
      const data = await res.json();

      setVulnerabilities(data.vulnerabilities || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, [page, severity, status, scanner]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVulnerabilities();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-indigo-400" /> Vulnerability Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Search, filter, analyze, and remediate all normalized security findings</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, CVE, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ACCEPTED_RISK">Accepted Risk</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          <div>
            <select
              value={scanner}
              onChange={(e) => {
                setScanner(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Scanners</option>
              <option value="OWASP_ZAP">OWASP ZAP</option>
              <option value="NMAP">Nmap</option>
              <option value="NIKTO">Nikto</option>
              <option value="TRIVY">Trivy</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">CVE / CWE</th>
                <th className="py-3 px-4">Asset Target</th>
                <th className="py-3 px-4">Scanner</th>
                <th className="py-3 px-4">OWASP Category</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading findings...
                  </td>
                </tr>
              ) : vulnerabilities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No vulnerabilities found matching filters.
                  </td>
                </tr>
              ) : (
                vulnerabilities.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <SeverityBadge severity={vuln.severity} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 max-w-[220px]">
                      <Link href={`/vulnerabilities/${vuln.id}`} className="hover:text-indigo-400 transition-colors line-clamp-1">
                        {vuln.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {vuln.cveId || vuln.cweId || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[130px]">
                      {vuln.asset?.name || "Global"}
                    </td>
                    <td className="py-3 px-4">
                      <ScannerBadge scanner={vuln.scanner} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[160px] truncate" title={vuln.owaspCategory}>
                      {vuln.owaspCategory || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={vuln.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
