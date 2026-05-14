import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WA Dashboard",
  description: "WA Reminder dashboard for UMKM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
