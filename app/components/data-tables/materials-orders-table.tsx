"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: MaterialOrder) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Order Number",
    accessorKey: "orderNumber",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Total Price",
    accessorKey: "totalPrice",
    cell: (order) => `${order.totalPrice} ${order.currency}`,
  },
  {
    header: "Order Date",
    accessorKey: "orderDate",
    cell: (order) => order.orderDate.toLocaleDateString(),
  },
  {
    header: "Expected Delivery",
    accessorKey: "expectedDelivery",
    cell: (order) => order.expectedDelivery.toLocaleDateString(),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (order) => (
      <span
        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
          order.status
        )}`}
      >
        {order.status}
      </span>
    ),
  },
];

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function MaterialOrdersTable({
  orders: initialOrders,
}: {
  orders: MaterialOrder[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(
    null
  );

  const handleEdit = (order: MaterialOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedOrder: Partial<MaterialOrder>) => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/material-orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const updated = await response.json();

      // Update the local state with the new data
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));

      setIsEditDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/material-orders/${selectedOrder.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      // Update local state by removing the deleted order
      setOrders(orders.filter((o) => o.id !== selectedOrder.id));
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.accessorKey}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-500"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${order.id}-${column.accessorKey}`}
                    className="px-4 py-2 text-sm"
                  >
                    {column.cell
                      ? column.cell(order)
                      : String(
                          order[column.accessorKey as keyof MaterialOrder]
                        )}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm">
                  <DataTableRowActions
                    onView={() =>
                      router.push(`/operations/material-orders/${order.id}`)
                    }
                    onEdit={() => handleEdit(order)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          title="Edit Order"
        >
          <MaterialOrderEditForm
            order={selectedOrder}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedOrder(null);
            }}
          />
        </DialogComponent>
      )}
    </>
  );
}
