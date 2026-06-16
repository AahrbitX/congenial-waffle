"use client";

import { Toast } from "@heroui/react";
import { SSRProvider } from "@react-aria/ssr";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/context/AuthContext";

import { SplashScreen } from "@/components/ui/SplashScreen";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SSRProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        <Toast.Provider />
        <ReactQueryDevtools />
        <SplashScreen />
      </QueryClientProvider>
    </SSRProvider>
  );
}
