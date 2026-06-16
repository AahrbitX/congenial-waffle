"use client";

import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@heroui/react";

import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { RatingModal } from "@/components/dashboard/RatingModal";
import { RaiseTicketModal } from "@/components/dashboard/RaiseTicketModal";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { bookOpen, closeBookModal } = useDashboard();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const role = (session?.user as any)?.role as string | undefined;

  useEffect(() => {
    if (isPending) return;
    if (!role) { startTransition(() => router.replace("/")); return; }
    if (role === "admin") { startTransition(() => router.replace("/admin")); return; }
    if (role !== "user") { startTransition(() => router.replace("/")); }
  }, [role, isPending]);

  // Only block when role is confirmed wrong — avoids SSR/client hydration mismatch
  if (!isPending && role && role !== "user") return null;

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

        <main className="flex-1 overflow-y-auto md:px-4 pb-24 md:pt-4 scrollbar-thin">
          {children}
        </main>
      </Surface>

      <NotificationPanel />
      <RatingModal />
      <RaiseTicketModal />
      <BookRideModal
        isOpen={bookOpen}
        onClose={closeBookModal}
        onBooked={closeBookModal}
      />
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
