import type { PropsWithChildren } from "react";
import Navigation from "./Navigation";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <Navigation />
      <main style={{ padding: "0 16px 24px" }}>{children}</main>
    </div>
  );
}
