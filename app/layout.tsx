// app/layout.tsx
import { ToastProvider } from "@/components/ui/toast";
import { Header } from "./components/layout/header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            {/* <aside className="w-64 bg-white hidden md:block">
              <Sidebar />
            </aside> */}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
