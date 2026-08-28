"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { PieChart as PieIcon } from "lucide-react";

interface SeverityChartProps {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#f59e0b",
  Low: "#3b82f6",
  Info: "#64748b",
};

export function SeverityChart({ counts }: SeverityChartProps) {
  const data = [
    { name: "Critical", value: counts.critical, color: COLORS.Critical },
    { name: "High", value: counts.high, color: COLORS.High },
    { name: "Medium", value: counts.medium, color: COLORS.Medium },
    { name: "Low", value: counts.low, color: COLORS.Low },
    { name: "Info", value: counts.info, color: COLORS.Info },
  ].filter((d) => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <PieIcon className="w-4 h-4 text-indigo-400" /> Vulnerability Severity
        </CardTitle>
      </CardHeader>
      <div className="h-64 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400">No vulnerabilities detected.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
