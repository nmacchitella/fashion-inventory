"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function getOrder(orderId: string) {
  try {
    const response = await fetch(`/api/material-orders/${orderId}`);
    const data = await response.json();

    if (!data || response.status === 404) {
      notFound();
    }

    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

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

export default function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<MaterialOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getOrder(resolvedParams.orderId).then(setOrder);
  }, [resolvedParams.orderId]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedOrder: Partial<MaterialOrder>) => {
    try {
      const response = await fetch(`/api/material-orders/${order.id}`, {
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
      setOrder(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/material-orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      router.push("/operations/material-orders");
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const detailItems = [
    { label: "Order Number", value: order.orderNumber },
    { label: "Supplier", value: order.supplier },
    {
      label: "Status",
      value: (
        <span
          className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      ),
    },
    { label: "Total Price", value: `${order.totalPrice} ${order.currency}` },
    {
      label: "Order Date",
      value: new Date(order.orderDate).toLocaleDateString(),
    },
    {
      label: "Expected Delivery",
      value: new Date(order.expectedDelivery).toLocaleDateString(),
    },
    {
      label: "Actual Delivery",
      value: order.actualDelivery
        ? new Date(order.actualDelivery).toLocaleDateString()
        : "Not delivered yet",
    },
    {
      label: "Order Items",
      value: (
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: item.material.colorCode }}
              />
              <span>
                {item.material.type} - {item.material.color}
              </span>
              <span className="text-gray-500">
                ({item.quantity} {item.unit} @ {item.unitPrice} {order.currency}
                )
              </span>
              <span className="text-gray-500">
                Total: {item.totalPrice} {order.currency}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    { label: "Notes", value: order.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(order.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(order.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Edit
            </button>
            <BackButton />
          </div>
        </div>
        <DetailsView title={`Order ${order.orderNumber}`} items={detailItems} />
      </div>

      <DialogComponent
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Order"
      >
        <MaterialOrderEditForm
          order={order}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      </DialogComponent>
    </>
  );
}
