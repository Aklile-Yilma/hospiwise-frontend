"use client";

import { usePathname } from "next/navigation";
import HospiwiseSidebar from "@/components/Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/auth");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!hideSidebar && <HospiwiseSidebar />}
      <main
        style={{
          flexGrow: 1,
          transition: "padding-left 0.3s",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}