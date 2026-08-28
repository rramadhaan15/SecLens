import React from "react";
import { Shield, AlertTriangle, Bug, CheckCircle2, TrendingDown } from "lucide-react";

interface SecurityScoreCardProps {
  score: number; // 0 - 100
  tier: string;
}

export function SecurityScoreCard({ score, tier }: SecurityScoreCardProps) {
  let scoreColor = "text-emerald-400 border-emerald-500/30 bg-emerald-950/30";
  if (score < 40) scoreColor = "text-red-400 border-red-500/30 bg-red-950/30";
  else if (score < 60) scoreColor = "text-orange-400 border-orange-500/30 bg-orange-950/30";
  else if (score < 80) scoreColor = "text-amber-400 border-amber-500/30 bg-amber-950/30";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
          Security Score
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-2 ${scoreColor}`}>
          <Shield className="w-3.5 h-3.5" /> {tier}
        </span>
      </div>

      {/* Circle progress ring representation */}
      <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
        <div
          className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin-slow"
          style={{ transform: `rotate(${(score / 100) * 360}deg)` }}
        />
        <Shield className="w-7 h-7 text-indigo-400" />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-indigo-400" }: StatCardProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
