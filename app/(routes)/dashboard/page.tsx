// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { AlertCircle, Box, Clock, Shirt } from "lucide-react";

// Function to fetch dashboard data
async function getDashboardData() {
  const materials = await prisma.material.findMany();
  const styles = await prisma.product.findMany({
    take: 5, // Last 5 styles
    orderBy: { createdAt: "desc" },
  });

  return {
    totalMaterials: materials.length,
    materials,
    recentStyles: styles,
    // Add more aggregations as needed
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Box className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-500">Total Materials</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{data.totalMaterials}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Shirt className="w-5 h-5 text-green-500" />
            <h3 className="text-gray-500">Active Styles</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data.recentStyles.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-gray-500">Pending Tasks</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">--</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-gray-500">Alerts</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">--</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Styles */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Styles</h2>
          <div className="space-y-4">
            {data.recentStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{style.name}</p>
                  <p className="text-sm text-gray-500">{style.phase}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(style.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Materials */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Low Stock Materials</h2>
          <div className="space-y-4">
            {data.materials
              .filter((m) => m.quantity < 100) // Example threshold
              .map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{material.type}</p>
                    <p className="text-sm text-gray-500">{material.color}</p>
                  </div>
                  <span
                    className={`text-sm ${
                      material.quantity < 50
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {material.quantity} {material.unit}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
