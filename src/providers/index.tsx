"use client";

import { Toast } from "@heroui/react";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toast.Provider />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
