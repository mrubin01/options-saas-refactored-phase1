import { useEffect, useState } from "react";
import {
  createSavedScreener,
  deleteSavedScreener,
  listSavedScreeners,
} from "../api/savedScreeners";
import type { SavedScreener, SavedScreenerConfig, StrategyType } from "../types/savedScreener";

type SavedScreenersPanelProps = {
  strategyType: StrategyType;
  getCurrentConfig: () => SavedScreenerConfig;
  onApply: (config: SavedScreenerConfig) => void;
};

export default function SavedScreenersPanel({
  strategyType,
  getCurrentConfig,
  onApply,
}: SavedScreenersPanelProps) {
  const [items, setItems] = useState<SavedScreener[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listSavedScreeners(strategyType);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved screeners");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [strategyType]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a screener name");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createSavedScreener({
        name: trimmed,
        strategy_type: strategyType,
        config_json: getCurrentConfig(),
      });

      setName("");
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save screener");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setError(null);
      await deleteSavedScreener(id);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete screener");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900">Saved screeners</h3>
        <p className="text-sm text-slate-500">Save and reload your current filters and sorting.</p>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Screener name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">No saved screeners yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <div>
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">{item.strategy_type}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onApply(item.config_json)}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
