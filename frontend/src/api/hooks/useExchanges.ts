import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { fetchExchanges } from "../exchanges";
import { queryKeys } from "../queryKeys";
import type { Exchange } from "../exchanges";

export function useExchanges() {
  const { user } = useAuth();
  return useQuery<Exchange[], Error>({
    queryKey: queryKeys.exchanges(),
    queryFn: fetchExchanges,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!user,
  });
}
