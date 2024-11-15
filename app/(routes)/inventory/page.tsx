// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";
import { InventoryControls } from "./inventory-controls";

async function getInventory() {
  const materials = await prisma.material.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return materials;
}

export default async function InventoryPage() {
  const initialMaterials = await getInventory();

  return (
    <div className="space-y-4">
      <InventoryControls initialMaterials={initialMaterials} />
    </div>
  );
}
