"use client";

import {
  Box,
  Factory,
  LayoutDashboard,
  Settings,
  Shirt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Box,
  },
  {
    title: "Products",
    href: "/products",
    icon: Shirt,
  },
  {
    title: "Operations",
    href: "/operations",
    icon: Factory,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Logo area */}
      <div className="px-6 py-8 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Logo
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 ease-in-out
                group relative
                ${
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon className={`
                w-5 h-5 transition-transform duration-200
                ${pathname === item.href ? "text-gray-900" : "text-gray-500"}
                group-hover:scale-110
              `} />
              <span className={`
                font-medium tracking-tight
                ${pathname === item.href ? "text-gray-900" : "text-gray-600"}
              `}>
                {item.title}
              </span>
              {pathname === item.href && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gray-900 rounded-r-full" />
              )}
            </span>
          </Link>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 py-6 border-t border-gray-100">
        <Link href="/settings">
          <span className="
            flex items-center space-x-3 px-3 py-2.5 rounded-lg
            text-gray-600 transition-all duration-200
            hover:bg-gray-50 hover:text-gray-900
            group
          ">
            <Settings className="w-5 h-5 text-gray-500 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium tracking-tight">Settings</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
