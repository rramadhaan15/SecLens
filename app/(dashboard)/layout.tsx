"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScanUploadModal } from "@/components/scans/scan-upload-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenUploadModal={() => setIsUploadModalOpen(true)} />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ScanUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          // Trigger page refresh or state reload if needed
          window.location.reload();
        }}
      />
    </div>
  );
}
