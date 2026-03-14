// src/components/Layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
