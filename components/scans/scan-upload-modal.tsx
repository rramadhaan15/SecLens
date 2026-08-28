"use client";

import React, { useState } from "react";
import { UploadCloud, X, FileCode, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ScanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScanUploadModal({ isOpen, onClose, onSuccess }: ScanUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scannerType, setScannerType] = useState<string>("AUTO");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a scan file first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (scannerType !== "AUTO") {
        formData.append("scannerType", scannerType);
      }

      const res = await fetch("/api/scans/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload scan file");
      }

      setSuccessMsg(data.message || "Scan imported successfully!");
      setFile(null);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Error uploading scan file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Import Security Scan</h3>
            <p className="text-xs text-slate-400">Supported: OWASP ZAP, Nmap, Nikto, Trivy (XML & JSON)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Dropzone */}
        <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-colors bg-slate-950/40 mb-4">
          <input
            type="file"
            id="scanFileInput"
            accept=".xml,.json,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="scanFileInput" className="cursor-pointer block">
            <FileCode className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
            {file ? (
              <span className="text-sm font-semibold text-slate-200 block">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-300 block">Click to select scan report</span>
                <span className="text-xs text-slate-400 mt-1 block">ZAP .xml/.json, Nmap .xml, Nikto .json, Trivy .json</span>
              </>
            )}
          </label>
        </div>

        {/* Scanner Type Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Scanner Engine</label>
          <select
            value={scannerType}
            onChange={(e) => setScannerType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="AUTO">Auto-Detect Format</option>
            <option value="OWASP_ZAP">OWASP ZAP (JSON / XML)</option>
            <option value="NMAP">Nmap (XML)</option>
            <option value="NIKTO">Nikto (JSON / Text)</option>
            <option value="TRIVY">Trivy (JSON)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-md shadow-indigo-950/50 transition-all cursor-pointer"
          >
            {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isUploading ? "Parsing Scan..." : "Parse & Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
