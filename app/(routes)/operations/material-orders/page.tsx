import { MaterialOrdersTable } from "@/components/data-tables/materials-orders-table";
import { prisma } from "@/lib/prisma";
import { MaterialOrder, MaterialOrderItem, OrderStatus, MeasurementUnit } from "@/types/materialOrder";

async function getMaterialOrders(): Promise<MaterialOrder[]> {
  const orders = await prisma.materialOrder.findMany({
    include: {
      orderItems: true,
    },
  });

  // Convert Prisma types to our custom types
  return orders.map(order => ({
    ...order,
    orderDate: new Date(order.orderDate),
    expectedDelivery: new Date(order.expectedDelivery),
    actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
    status: order.status as OrderStatus,
    notes: order.notes || undefined, // Convert null to undefined
    orderItems: order.orderItems.map(item => ({
      ...item,
      unit: item.unit as MeasurementUnit,
      notes: item.notes || undefined, // Convert null to undefined
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    })) as MaterialOrderItem[],
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt)
  }));
}

export default async function MaterialOrdersPage() {
  const orders = await getMaterialOrders();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Orders</h1>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Add Material Order
        </button>
      </div>

      <MaterialOrdersTable orders={orders} />
    </div>
  );
}
