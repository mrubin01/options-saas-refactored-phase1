import { useEffect, useState } from "react";
import {
  createSavedScreener,
  deleteSavedScreener,
  listSavedScreeners,
  updateSavedScreener,
} from "../api/savedScreeners";
import type {
  SavedScreener,
  SavedScreenerConfig,
  StrategyType,
} from "../types/savedScreener";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [duplicateCandidate, setDuplicateCandidate] =
    useState<SavedScreener | null>(null);

  async function loadItems() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listSavedScreeners(strategyType);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load saved screeners",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [strategyType]);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  function startRename(item: SavedScreener) {
    setEditingId(item.id);
    setEditingName(item.name);
    resetMessages();
  }

  function cancelRename() {
    setEditingId(null);
    setEditingName("");
  }

  function clearDuplicateCandidate() {
    setDuplicateCandidate(null);
  }

  function handleApply(config: SavedScreenerConfig) {
    resetMessages();
    clearDuplicateCandidate();
    onApply(config);
    setSuccess("Screener applied.");
  }

  async function handleUpdateConfig(id: number) {
    try {
      setUpdatingId(id);
      resetMessages();

      await updateSavedScreener(id, {
        config_json: getCurrentConfig(),
      });

      await loadItems();
      setSuccess("Screener updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update screener",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRename(id: number) {
    const trimmed = editingName.trim();

    if (!trimmed) {
      setError("Please enter a screener name");
      return;
    }

    try {
      setIsRenaming(true);
      resetMessages();

      await updateSavedScreener(id, {
        name: trimmed,
      });

      setEditingId(null);
      setEditingName("");
      await loadItems();
      setSuccess("Screener renamed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to rename screener",
      );
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleOverwriteDuplicate() {
    if (!duplicateCandidate) {
      return;
    }

    try {
      setIsSaving(true);
      resetMessages();

      await updateSavedScreener(duplicateCandidate.id, {
        config_json: getCurrentConfig(),
      });

      setDuplicateCandidate(null);
      setName("");
      await loadItems();
      setSuccess("Existing screener overwritten successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to overwrite screener",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Please enter a screener name");
      return;
    }

    const existing = items.find(
      (item) => item.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      setDuplicateCandidate(existing);
      setSuccess(null);
      setError(null);
      return;
    }

    try {
      setIsSaving(true);
      resetMessages();
      setDuplicateCandidate(null);

      await createSavedScreener({
        name: trimmed,
        strategy_type: strategyType,
        config_json: getCurrentConfig(),
      });

      setName("");
      await loadItems();
      setSuccess("Screener saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save screener");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      resetMessages();

      if (editingId === id) {
        cancelRename();
      }

      if (duplicateCandidate?.id === id) {
        clearDuplicateCandidate();
      }

      await deleteSavedScreener(id);
      await loadItems();
      setSuccess("Screener deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete screener",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const btnBase = "rounded-md border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-navy">Saved screeners</h3>
        <p className="text-xs text-muted">
          Save, rename, update, and reload your current filters and sorting.
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (duplicateCandidate) setDuplicateCandidate(null);
          }}
          placeholder="Screener name"
          className="flex-1 rounded-md border border-border-dark bg-surface px-3 py-2 text-sm text-navy placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={isSaving}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {duplicateCandidate && (
        <div className="mb-3 rounded-lg border border-amber-700 bg-amber-950/30 px-3 py-3 text-sm text-amber-300">
          <div className="mb-2">
            A screener named <strong>{duplicateCandidate.name}</strong> already exists.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleOverwriteDuplicate()}
              disabled={isSaving}
              className={`${btnBase} border-amber-700 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40`}
            >
              {isSaving ? "Overwriting…" : "Overwrite existing"}
            </button>
            <button
              type="button"
              onClick={clearDuplicateCandidate}
              disabled={isSaving}
              className={`${btnBase} border-border bg-surface text-navy hover:bg-bg`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted">No saved screeners yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isUpdatingThis = updatingId === item.id;
            const isDeletingThis = deletingId === item.id;
            const isEditingThis = editingId === item.id;
            const isBusy = isUpdatingThis || isDeletingThis || (isEditingThis && isRenaming);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-md border border-border-dark px-3 py-1.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        disabled={isRenaming}
                      />
                      <button
                        type="button"
                        onClick={() => void handleRename(item.id)}
                        disabled={isRenaming}
                        className={`${btnBase} border-primary bg-primary text-white hover:bg-primary-hover`}
                      >
                        {isRenaming ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        disabled={isRenaming}
                        className={`${btnBase} border-border bg-surface text-navy hover:bg-bg`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-navy">{item.name}</div>
                      <div className="text-xs text-muted">{item.strategy_type}</div>
                    </>
                  )}
                </div>

                {editingId !== item.id && (
                  <div className="ml-4 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApply(item.config_json)}
                      disabled={isBusy}
                      className={`${btnBase} border-border bg-surface text-navy hover:bg-bg`}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUpdateConfig(item.id)}
                      disabled={isBusy}
                      className={`${btnBase} border-border bg-surface text-navy hover:bg-bg`}
                    >
                      {isUpdatingThis ? "Updating…" : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startRename(item)}
                      disabled={isBusy}
                      className={`${btnBase} border-border bg-surface text-navy hover:bg-bg`}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      disabled={isBusy}
                      className={`${btnBase} border-red-800 bg-red-950/30 text-red-400 hover:bg-red-900/40`}
                    >
                      {isDeletingThis ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
