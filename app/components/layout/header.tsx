// app/components/layout/header.tsx
import { MainNav } from "./main-nav";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/80">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Fashion Inventory
        </h2>
      </div>

      <div className="flex-1 mx-8">
        <MainNav />
      </div>
    </header>
  );
}
