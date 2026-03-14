import type { OptionsFilters } from "../types/filters";

interface Props {
  filters: OptionsFilters;
  onChange: (filters: OptionsFilters) => void;
  exchanges: { id: number; name: string }[];
}

export default function OptionsFilters({
  filters,
  onChange,
  exchanges,
}: Props) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Ticker */}
      <input
        placeholder="Ticker"
        value={filters.ticker || ""}
        onChange={(e) =>
          onChange({ ...filters, ticker: e.target.value || undefined })
        }
        style={{ marginRight: "0.5rem" }}
      />

      {/* Contract */}
      <input
        placeholder="Contract"
        value={filters.contract || ""}
        onChange={(e) =>
          onChange({ ...filters, contract: e.target.value || undefined })
        }
        style={{ marginRight: "0.5rem" }}
      />

      {/* Exchange */}
      <select
        value={filters.exchange ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            exchange: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        style={{ marginRight: "0.5rem" }}
      >
        <option value="">All Exchanges</option>
        {exchanges.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {/* Expiry Date */}
      <input
        type="date"
        value={filters.expiry_date || ""}
        onChange={(e) =>
          onChange({
            ...filters,
            expiry_date: e.target.value || undefined,
          })
        }
      />
    </div>
  );
}
