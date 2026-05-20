import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seneco AI Support Triage Demo",
  description: "n8n workflow demo for AI-powered support request triage automation",
};

export default function SenecoDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {children}
    </div>
  );
}