"use client";

import { queryClient } from "@/lib/query-client";
import { Toast } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toast.Provider />
    </QueryClientProvider>
  );
}
