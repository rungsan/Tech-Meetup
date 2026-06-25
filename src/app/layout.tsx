import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIS — ระบบตรวจสภาพรถยนต์",
  description: "Car Inspection System & E-Motor Survey — ABC ประกันภัย",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-canvas text-fg antialiased">{children}</body>
    </html>
  );
}
