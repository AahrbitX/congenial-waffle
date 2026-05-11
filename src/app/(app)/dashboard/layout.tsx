"use client";

import { DashboardProvider } from "@/context/DashboardContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { RatingModal } from "@/components/dashboard/RatingModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[var(--color-surface-muted)] flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          <DashboardHeader />
          {children}
        </main>
        <NotificationPanel />
        <RatingModal />
      </div>
    </DashboardProvider>
  );
}
