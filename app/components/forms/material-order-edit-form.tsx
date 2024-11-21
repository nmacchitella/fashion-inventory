"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useState } from "react";

interface MaterialOrderEditFormProps {
  order: MaterialOrder;
  onSaveSuccess: (updatedOrder: MaterialOrder) => void;
  onDeleteSuccess?: (orderId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
}

// Helper function to safely format dates
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime())
    ? d.toISOString().split("T")[0]
    : "";
};

export function MaterialOrderEditForm({
  order,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: MaterialOrderEditFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: order.orderNumber,
    supplier: order.supplier,
    status: order.status,
    totalPrice: order.totalPrice,
    currency: order.currency,
    orderDate: formatDate(order.orderDate),
    expectedDelivery: formatDate(order.expectedDelivery),
    actualDelivery: formatDate(order.actualDelivery),
    notes: order.notes || "",
  });

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const processedData = {
        ...formData,
        totalPrice: parseFloat(formData.totalPrice.toString()),
        orderDate: new Date(formData.orderDate),
        expectedDelivery: new Date(formData.expectedDelivery),
        actualDelivery: formData.actualDelivery
          ? new Date(formData.actualDelivery)
          : null,
      };

      onSaveSuccess(processedData as MaterialOrder);
      showToast(
        `Order ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save order",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(order.id);
      showToast("Order deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete order",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Order Number
            </label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, supplier: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as OrderStatus,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Total Price
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPrice: parseFloat(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-20 px-3 py-2 border rounded-md"
                placeholder="USD"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Order Date
            </label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Expected Delivery
            </label>
            <input
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedDelivery: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Actual Delivery
            </label>
            <input
              type="date"
              value={formData.actualDelivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  actualDelivery: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Order
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Order"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
