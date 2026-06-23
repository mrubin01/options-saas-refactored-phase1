type Props = {
  title: string;
  children: React.ReactNode;
};

export default function StrategyHelpPanel({ title, children }: Props) {
  return (
    <details className="group my-4 rounded-xl border border-border bg-bg overflow-hidden">
      <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 text-sm font-semibold text-navy hover:bg-border/50 transition-colors">
        <span className="text-muted group-open:rotate-90 transition-transform">▶</span>
        {title}
      </summary>
      <div className="border-t border-border px-4 py-4 text-sm text-muted leading-relaxed space-y-2">
        {children}
      </div>
    </details>
  );
}
