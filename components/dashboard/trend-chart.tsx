"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp } from "lucide-react";

interface TrendChartProps {
  data: Array<{ date: string; open: number; resolved: number }>;
}

export function TrendChart({ data }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <TrendingUp className="w-4 h-4 text-indigo-400" /> Vulnerability Trend Over Time
        </CardTitle>
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
          {["30d", "90d", "6m"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                timeRange === range ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="open" name="Open Issues" stroke="#ef4444" fillOpacity={1} fill="url(#colorOpen)" />
            <Area type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
