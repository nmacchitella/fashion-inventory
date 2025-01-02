// app/inventory/page.tsx
import { Package, Volleyball } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const inventories = [
    {
      title: "Materials",
      description: "Track current material inventory.",
      href: "/inventory/materials",
      IconComponent: Volleyball, // Store the component itself
      // stats: {
      //   active: 5,
      //   pending: 2,
      // },
    },
    {
      title: "Products",
      description: "Track current product inventory.",
      href: "/inventory/products",
      IconComponent: Package,
      // stats: {
      //   active: 5,
      //   pending: 2,
      // },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inventory) => (
          <Link
            key={inventory.title}
            href={inventory.href}
            className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                <inventory.IconComponent className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{inventory.title}</h3>
                <p className="text-sm text-gray-500">{inventory.description}</p>
              </div>
            </div>

            {/* {inventory.stats && (
              <div className="mt-4 flex space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {inventory.stats.active}
                  </span>
                  <span className="text-gray-500"> active</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {inventory.stats.pending}
                  </span>
                  <span className="text-gray-500"> pending</span>
                </div>
              </div>
            )} */}
          </Link>
        ))}
      </div>
    </div>
  );
}
