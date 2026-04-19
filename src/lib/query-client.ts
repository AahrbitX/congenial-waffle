import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays "fresh" for 1 minute to reduce backend load
      staleTime: 60 * 1000,
      // Retry failed requests twice before showing an error
      retry: 2,
      // Ensures focus refetching is consistent
      refetchOnWindowFocus: false,
    },
  },
});
