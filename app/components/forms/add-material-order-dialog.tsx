"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useRouter } from "next/navigation";

interface AddMaterialOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order: MaterialOrder) => void;
}

const defaultOrder: Omit<MaterialOrder, "id" | "createdAt" | "updatedAt"> = {
  orderNumber: "",
  supplier: "",
  orderItems: [],
  totalPrice: 0,
  currency: "USD",
  orderDate: new Date(),
  expectedDelivery: new Date(),
  actualDelivery: undefined,
  status: OrderStatus.PENDING,
  notes: "",
};

export function AddMaterialOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialOrderDialogProps) {
  const router = useRouter();

  const handleSave = async (orderData: Partial<MaterialOrder>) => {
    try {
      const response = await fetch("/api/material-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const newOrder = await response.json();
      onSuccess(newOrder);
      onOpenChange(false);
      router.refresh(); // Refresh server-side data
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Material Order"
    >
      <MaterialOrderEditForm
        order={defaultOrder as MaterialOrder}
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}
