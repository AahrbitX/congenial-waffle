"use client";

import { Surface } from "@heroui/react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { RatingModal } from "@/components/dashboard/RatingModal";
import { RaiseTicketModal } from "@/components/dashboard/RaiseTicketModal";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { bookOpen, closeBookModal } = useDashboard();

  return (
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
      <RaiseTicketModal />
      <BookRideModal isOpen={bookOpen} onClose={closeBookModal} onBooked={closeBookModal} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
