import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { apiGet } from "../client";

type Strategy = "covered-calls" | "put-options" | "spread-options";

export function useExpiryDates(strategy: Strategy) {
  const { user } = useAuth();
  return useQuery<string[], Error>({
    queryKey: ["expiry-dates", strategy],
    queryFn: () => apiGet<string[]>(`/${strategy}/expiry-dates`),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
}
