import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../auth/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.status;
        if (status === 401 || status === 403 || status === 422) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
