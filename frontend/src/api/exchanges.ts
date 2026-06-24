import { apiGet } from "./client";

export type Exchange = { id: number; name: string };

export async function fetchExchanges(): Promise<Exchange[]> {
  return apiGet<Exchange[]>("/exchanges");
}
