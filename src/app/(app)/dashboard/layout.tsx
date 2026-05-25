"use client";

import { Surface } from "@heroui/react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";
import { RatingModal } from "@/components/dashboard/RatingModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="h-screen overflow-hidden flex">
        <Sidebar />

        <Surface
          variant="secondary"
          className="flex-1 min-w-0 h-full flex flex-col overflow-hidden"
        >
          <div className="shrink-0 px-6 pt-4 border-b">
            <DashboardHeader />
          </div>

          <main className="flex-1 overflow-y-auto px-4 pb-26 pt-4 scrollbar-thin">
            {children}
          </main>
        </Surface>

        <NotificationPanel />
        <RatingModal />
      </div>
    </DashboardProvider>
  );
}
