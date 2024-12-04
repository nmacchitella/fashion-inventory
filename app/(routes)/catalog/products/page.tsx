// app/routes/operations/material-orders/page.tsx
import { prisma } from "@/lib/prisma";
import { MaterialOrdersControls } from "./material-orders-controls";

async function getMaterialOrders() {
  const orders = await prisma.materialOrder.findMany({
    include: {
      orderItems: {
        include: {
          material: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
}

export default async function MaterialOrdersPage() {
  const initialOrders = await getMaterialOrders();

  return (
    <div className="space-y-4">
      <MaterialOrdersControls initialOrders={initialOrders} />
    </div>
  );
}