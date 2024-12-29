// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";

async function getInventory() {
  const materials = await prisma.material.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return materials;
}

export default async function MaterialOrderPage() {
  return <div className="space-y-4">hello</div>;
}
