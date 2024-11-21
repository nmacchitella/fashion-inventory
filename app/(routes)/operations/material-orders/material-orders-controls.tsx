"use client";

import { MaterialOrdersTable } from "@/components/data-tables/materials-orders-table";
import { AddMaterialOrderDialog } from "@/components/forms/add-material-order-dialog";
import { MaterialOrder } from "@/types/materialOrder";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MaterialOrdersControlsProps {
  initialOrders: MaterialOrder[];
}

export function MaterialOrdersControls({
  initialOrders,
}: MaterialOrdersControlsProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);

  const handleAddSuccess = (newOrder: MaterialOrder) => {
    console.log("New order before setState:", newOrder);
    setOrders((prevOrders) => {
      console.log("Previous orders:", prevOrders);
      const newOrders = [newOrder, ...prevOrders];
      console.log("New orders array:", newOrders);
      return newOrders;
    });
    setIsAddDialogOpen(false);
    router.refresh(); // Refresh server-side data
  };

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/material-orders/${orderId}`, {
        method: "DELETE",
      });

      // Since we're returning 204 No Content, we shouldn't try to parse the response
      if (response.status === 204) {
        setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));
        router.refresh(); // Refresh server-side data
        return; // Exit early on success
      }

      // If we got a different status, try to get error details
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete order");
    } catch (error) {
      console.error("Error deleting order:", error);
      // Instead of re-throwing the error, we could show a toast notification
      throw new Error(
        "Failed to delete order: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleUpdate = (updatedOrder: MaterialOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    router.refresh(); // Refresh server-side data
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Orders</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material Order
        </button>
      </div>

      <MaterialOrdersTable
        orders={orders}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      <AddMaterialOrderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
