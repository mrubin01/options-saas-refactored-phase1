type PageHeaderProps = {
  title: string;
  lastUpdated?: string | null;
};

export default function PageHeader({ title, lastUpdated }: PageHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-navy">{title}</h1>
      {lastUpdated && (
        <p className="mt-1 text-xs text-muted">Last updated: {lastUpdated}</p>
      )}
    </div>
  );
}
