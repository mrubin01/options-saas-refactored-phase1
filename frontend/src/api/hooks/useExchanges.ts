import { useQuery } from "@tanstack/react-query";
import { fetchExchanges } from "../exchanges";
import { queryKeys } from "../queryKeys";
import type { Exchange } from "../exchanges";

export function useExchanges() {
  return useQuery<Exchange[], Error>({
    queryKey: queryKeys.exchanges(),
    queryFn: fetchExchanges,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
