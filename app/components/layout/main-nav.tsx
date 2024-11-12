"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Inventory",
    href: "/inventory",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "Operations",
    href: "/operations",
  },
  {
    title: "Contacts",
    href: "/contacts",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            relative group
            ${
              pathname === item.href
                ? "text-black"
                : "text-gray-600 hover:text-black"
            }
          `}
        >
          {item.title}
          <span
            className={`
              absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-200
              ${
                pathname === item.href
                  ? "bg-black/90 w-full"
                  : "bg-black/0 w-0 group-hover:w-full group-hover:bg-black/20"
              }
            `}
          />
        </Link>
      ))}
    </nav>
  );
}
