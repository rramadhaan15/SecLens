"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Sliders, Database, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" /> System Settings & Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure SecLens security scoring rules, scanner parsers, and API access tokens</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scoring Engine Config */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Sliders className="w-4 h-4 text-indigo-400" /> Security Score Algorithm Penalty Weights
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-red-400">Critical Severity Penalty</span>
              <span className="font-bold text-white">-25 points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-orange-400">High Severity Penalty</span>
              <span className="font-bold text-white">-10 points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-amber-400">Medium Severity Penalty</span>
              <span className="font-bold text-white">-3 points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-400">Low Severity Penalty</span>
              <span className="font-bold text-white">-1 point</span>
            </div>
          </div>
        </Card>

        {/* Database & Integration status */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Database className="w-4 h-4 text-indigo-400" /> Database & Environment Status
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-semibold text-emerald-400">PostgreSQL (Prisma ORM)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Authentication</span>
              <span className="font-semibold text-indigo-400">NextAuth JWT Sessions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Supported Scanners</span>
              <span className="font-semibold text-slate-200">ZAP · Nmap · Nikto · Trivy</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
