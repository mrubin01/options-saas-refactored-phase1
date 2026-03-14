type ApiStatusProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
};

export default function ApiStatus({ loading, error, empty, emptyMessage = "No results found." }: ApiStatusProps) {
  if (loading) {
    return <div className="text-sm text-gray-500 py-6">Loading results…</div>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (empty) {
    return <div className="text-sm text-gray-500 py-6">{emptyMessage}</div>;
  }

  return null;
}
