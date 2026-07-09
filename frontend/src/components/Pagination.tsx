type PaginationProps = {
  offset: number;
  limit: number;
  total: number;
  onChange: (newOffset: number) => void;
};

export default function Pagination({ offset, limit, total, onChange }: PaginationProps) {
  if (total === 0) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center justify-between py-3 text-sm text-muted border-t border-border mt-1">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className="px-3 py-1 rounded border border-border text-sm disabled:opacity-40 hover:bg-border/40 transition-colors"
        >
          Previous
        </button>
        <span className="px-2 text-xs">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onChange(offset + limit)}
          className="px-3 py-1 rounded border border-border text-sm disabled:opacity-40 hover:bg-border/40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
