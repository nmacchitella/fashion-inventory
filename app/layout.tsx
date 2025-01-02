// app/layout.tsx
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata } from "next";
import { Header } from "./components/layout/header";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Fashion Inventory",
  description: "Inventory management system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <SessionProvider session={session}>
          <ToastProvider>
            <div className="flex h-screen overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
                  <div className="mx-auto max-w-7xl">{children}</div>
                </main>
              </div>
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}