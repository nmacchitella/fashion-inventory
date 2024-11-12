import { MaterialsTable } from "@/components/data-tables/materials-table";
import { prisma } from "@/lib/prisma";

async function getInventory() {
  const materials = await prisma.material.findMany();
  return materials;
}

export default async function InventoryPage() {
  const materials = await getInventory();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Add Material
        </button>
      </div>

      <MaterialsTable materials={materials} />
    </div>
  );
}
