"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OWASP_TOP_10_2021 } from "@/lib/owasp/owasp-mapper";
import { BarChart3, ShieldCheck, ExternalLink, Bug } from "lucide-react";
import Link from "next/link";
import { SeverityBadge } from "@/components/ui/badge";

export default function OwaspPage() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVulns() {
      try {
        const res = await fetch("/api/vulnerabilities?limit=100");
        const data = await res.json();
        setVulnerabilities(data.vulnerabilities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVulns();
  }, []);

  const owaspKeys = Object.keys(OWASP_TOP_10_2021);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> OWASP Top 10 Analytics (2021)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Categorized risk intelligence mapped using <span className="text-indigo-400 font-semibold">SecLens OWASP Mapping</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {owaspKeys.map((key) => {
          const item = OWASP_TOP_10_2021[key];
          const matchedVulns = vulnerabilities.filter((v) => v.owaspCategory?.includes(item.code));

          return (
            <Card key={key} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800">
                      {item.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{item.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    {matchedVulns.length} Findings
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{item.description}</p>
              </div>

              {matchedVulns.length > 0 && (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Associated Vulnerabilities</span>
                  {matchedVulns.slice(0, 3).map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-xs">
                      <Link href={`/vulnerabilities/${v.id}`} className="text-slate-200 hover:text-indigo-400 truncate max-w-[80%]">
                        {v.title}
                      </Link>
                      <SeverityBadge severity={v.severity} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
