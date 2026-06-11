type Props = {
  title: string;
  children: React.ReactNode;
};

export default function StrategyHelpPanel({ title, children }: Props) {
  return (
    <details
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "0.75rem 1rem",
        margin: "1rem 0",
        background: "#f8fafc",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {title}
      </summary>

      <div
        style={{
          marginTop: "0.75rem",
          color: "#475569",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </details>
  );
}
