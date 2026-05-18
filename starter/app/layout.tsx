import type { Metadata } from "next";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Control Center",
  description: "Internal dashboard for lab asset scan workflows and reconciliation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="font-semibold text-gray-900">
              Asset Control Center
            </a>
            <RoleSwitcher />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
