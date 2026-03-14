type PageHeaderProps = {
  title: string;
  lastUpdated?: string | null;
};

export default function PageHeader({ title, lastUpdated }: PageHeaderProps) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {lastUpdated && (
        <div className="text-sm text-gray-500 mb-2">Last updated: {lastUpdated}</div>
      )}
    </>
  );
}
