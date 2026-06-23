type ApiStatusProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
};

export default function ApiStatus({
  loading,
  error,
  empty,
  emptyMessage = "No results found.",
}: ApiStatusProps) {
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted">
        Loading results…
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="py-10 text-center text-sm text-muted">{emptyMessage}</div>
    );
  }

  return null;
}
