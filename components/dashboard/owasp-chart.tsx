"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { BarChart3 } from "lucide-react";

interface OwaspChartProps {
  distribution: Array<{ category: string; name: string; count: number }>;
}

export function OwaspChart({ distribution }: OwaspChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <BarChart3 className="w-4 h-4 text-indigo-400" /> OWASP Top 10 Distribution (2021)
        </CardTitle>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any, item: any) => [
                `${value} findings`,
                `${item.payload.category} - ${item.payload.name}`,
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count > 3 ? "#ef4444" : entry.count > 0 ? "#6366f1" : "#334155"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
