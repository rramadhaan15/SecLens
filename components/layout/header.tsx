"use client";

import React from "react";
import { Search, User, UploadCloud, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onOpenUploadModal?: () => void;
}

export function Header({ onOpenUploadModal }: HeaderProps) {
  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 sticky top-0 z-20 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search CVEs, vulnerabilities, assets..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Import Scan Button */}
        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-950/50 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Import Scan
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        {/* Demo User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-semibold text-slate-200 flex items-center gap-1">
              Demo Lead <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </span>
            <span className="block text-[10px] text-slate-400">demo@seclens.local</span>
          </div>
        </div>
      </div>
    </header>
  );
}
