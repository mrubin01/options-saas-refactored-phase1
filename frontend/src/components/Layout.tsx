import type { PropsWithChildren } from "react";
import Navigation from "./Navigation";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navigation />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}
