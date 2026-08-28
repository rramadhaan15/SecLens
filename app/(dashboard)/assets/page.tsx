"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Plus, ShieldAlert, Globe, HardDrive, Cpu, Container } from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("URL");
  const [environment, setEnvironment] = useState("PRODUCTION");
  const [riskLevel, setRiskLevel] = useState("HIGH");
  const [projectId, setProjectId] = useState("");

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const [resA, resP] = await Promise.all([fetch("/api/assets"), fetch("/api/projects")]);
      const dataA = await resA.json();
      const dataP = await resP.json();
      setAssets(dataA || []);
      setProjects(dataP || []);
      if (dataP.length > 0) setProjectId(dataP[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, target, type, environment, riskLevel, projectId }),
      });
      if (res.ok) {
        setName("");
        setTarget("");
        setShowModal(false);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" /> Monitored Assets
          </h1>
          <p className="text-xs text-slate-400 mt-1">Register domains, IP addresses, APIs, containers, and web servers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory ({assets.length})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-semibold bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target / Endpoint</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Scans / Vulns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No assets registered yet.</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-400" />
                      {asset.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {asset.target}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {asset.environment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          asset.riskLevel === "CRITICAL"
                            ? "bg-red-950 text-red-400 border-red-800"
                            : "bg-amber-950 text-amber-400 border-amber-800"
                        }`}
                      >
                        {asset.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {asset.project?.name || "Global"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {asset._count?.scans ?? 0} Scans / <span className="text-rose-400">{asset._count?.vulnerabilities ?? 0} Vulns</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-white mb-4">Register New Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payment API Gateway"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Endpoint / Host</label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. https://api.payments.local or 10.0.4.15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="URL">URL / Web Endpoint</option>
                    <option value="DOMAIN">Domain</option>
                    <option value="IP">IP Address</option>
                    <option value="APPLICATION">Application API</option>
                    <option value="CONTAINER">Container Image</option>
                    <option value="SERVER">Host Server</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
