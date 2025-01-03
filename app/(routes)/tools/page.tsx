// app/inventory/page.tsx
import Link from "next/link";

export default function OperationPage() {
  const operations = [
    {
      title: "Prepare a Material Order",
      description: "Track and manage material orders and their status",
      href: "/tools/calculate-materials",
      icon: "📦", // We can replace this with a proper icon
      stats: {
        active: 5, // These could be real numbers from your DB
        pending: 2,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operations</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((operation) => (
          <Link
            key={operation.title}
            href={operation.href}
            className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{operation.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{operation.title}</h3>
                <p className="text-sm text-gray-500">{operation.description}</p>
              </div>
            </div>

            {operation.stats && (
              <div className="mt-4 flex space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {operation.stats.active}
                  </span>
                  <span className="text-gray-500"> active</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {operation.stats.pending}
                  </span>
                  <span className="text-gray-500"> pending</span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
