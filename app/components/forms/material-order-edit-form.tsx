"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Material } from "@/types/material";
import {
  MaterialOrder,
  MeasurementUnit,
  OrderStatus,
} from "@/types/materialOrder";
import { useEffect, useMemo, useState } from "react";

interface MaterialOrderEditFormProps {
  order: MaterialOrder;
  onSaveSuccess: (updatedOrder: MaterialOrder) => void;
  onDeleteSuccess?: (orderId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
}

interface OrderItemFormData {
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice: number;
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

  const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch available materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/materials");
        const materials = await response.json();
        setAvailableMaterials(materials);
      } catch (error) {
        console.error("Error fetching materials:", error);
        showToast("Failed to load materials", "error");
      }
    };

    fetchMaterials();
  }, []);

  // New state for stepped selection
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);

  // Computed values based on available materials
  const availableBrands = useMemo(() => {
    const brands = new Set(availableMaterials.map((m) => m.brand));
    return Array.from(brands).sort();
  }, [availableMaterials]);

  const availableTypes = useMemo(() => {
    if (!selectedBrand) return [];
    const types = new Set(
      availableMaterials
        .filter((m) => m.brand === selectedBrand)
        .map((m) => m.type)
    );
    return Array.from(types).sort();
  }, [selectedBrand, availableMaterials]);

  const availableColors = useMemo(() => {
    if (!selectedBrand || !selectedType) return [];
    return availableMaterials
      .filter((m) => m.brand === selectedBrand && m.type === selectedType)
      .map((m) => ({
        id: m.id,
        color: m.color,
        colorCode: m.colorCode,
        costPerUnit: m.costPerUnit,
        unit: m.unit,
      }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [selectedBrand, selectedType, availableMaterials]);

  const selectedMaterial = useMemo(
    () => availableMaterials.find((m) => m.id === selectedMaterialId),
    [selectedMaterialId, availableMaterials]
  );

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedType("");
    setSelectedMaterialId("");
    setQuantity(0);
  }, [selectedBrand]);

  useEffect(() => {
    setSelectedMaterialId("");
    setQuantity(0);
  }, [selectedType]);

  useEffect(() => {
    setQuantity(0);
  }, [selectedMaterialId]);

  const handleAddOrderItem = () => {
    if (!selectedMaterial || quantity <= 0) {
      showToast("Please complete all fields", "error");
      return;
    }

    const newOrderItem: OrderItemFormData = {
      materialId: selectedMaterial.id,
      quantity: quantity,
      unit: selectedMaterial.unit,
      unitPrice: selectedMaterial.costPerUnit,
    };

    setOrderItems([...orderItems, newOrderItem]);

    // Update total price
    const itemTotal = quantity * selectedMaterial.costPerUnit;
    setFormData((prev) => ({
      ...prev,
      totalPrice: prev.totalPrice + itemTotal,
    }));

    // Reset selection
    setSelectedBrand("");
    setSelectedType("");
    setSelectedMaterialId("");
    setQuantity(0);
  };

  const handleRemoveOrderItem = (index: number) => {
    const removedItem = orderItems[index];
    const itemTotal = removedItem.quantity * removedItem.unitPrice;

    setOrderItems(orderItems.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      totalPrice: prev.totalPrice - itemTotal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (orderItems.length === 0) {
        throw new Error("Please add at least one material to the order");
      }

      const processedData = {
        ...formData,
        totalPrice: parseFloat(formData.totalPrice.toString()),
        orderDate: new Date(formData.orderDate),
        expectedDelivery: new Date(formData.expectedDelivery),
        actualDelivery: formData.actualDelivery
          ? new Date(formData.actualDelivery)
          : null,
        orderItems: orderItems.map((item) => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice,
        })),
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing form fields */}
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

        {/* Order Items Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>

          {/* Stepped material selection form */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Brand Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Brand</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedBrand}
              >
                <option value="">Select Type</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedType}
              >
                <option value="">Select Color</option>
                {availableColors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.color} ({color.colorCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="0.01"
                    disabled={!selectedMaterialId}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddOrderItem}
                  disabled={!selectedMaterialId || quantity <= 0}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Display unit price if material is selected */}
          {selectedMaterial && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Price: {selectedMaterial.costPerUnit} {formData.currency} per{" "}
                {selectedMaterial.unit}
                {quantity > 0 && (
                  <span className="ml-2">
                    | Total:{" "}
                    {(quantity * selectedMaterial.costPerUnit).toFixed(2)}{" "}
                    {formData.currency}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Order items list */}
          {orderItems.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Material
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => {
                    const material = availableMaterials.find(
                      (m) => m.id === item.materialId
                    );
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {material && (
                            <>
                              <div>
                                {material.brand} - {material.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {material.color} ({material.colorCode})
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2">
                          {item.unitPrice} {formData.currency}
                        </td>
                        <td className="px-4 py-2">
                          {(item.quantity * item.unitPrice).toFixed(2)}{" "}
                          {formData.currency}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveOrderItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between border-t pt-6">
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
              disabled={isSaving || orderItems.length === 0}
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

// "use client";

// import { ConfirmDialog } from "@/components/ui/confirm-dialog";
// import { useToast } from "@/components/ui/toast";
// import { Material } from "@/types/material";
// import { MaterialOrder, MaterialOrderItem, MeasurementUnit, OrderStatus } from "@/types/materialOrder";
// import { useState, useEffect, useMemo } from "react";

// interface MaterialOrderEditFormProps {
//   order: MaterialOrder;
//   onSaveSuccess: (updatedOrder: MaterialOrder) => void;
//   onDeleteSuccess?: (orderId: string) => Promise<void>;
//   onCancel: () => void;
//   mode?: "edit" | "create";
// }

// interface OrderItemFormData {
//   materialId: string;
//   quantity: number;
//   unit: MeasurementUnit;
//   unitPrice: number;
// }

// // Helper function to safely format dates
// const formatDate = (date: Date | string | null | undefined) => {
//   if (!date) return "";
//   const d = typeof date === "string" ? new Date(date) : date;
//   return d instanceof Date && !isNaN(d.getTime())
//     ? d.toISOString().split("T")[0]
//     : "";
// };

// export function MaterialOrderEditForm({
//   order,
//   onSaveSuccess,
//   onDeleteSuccess,
//   onCancel,
//   mode = "edit",
// }: MaterialOrderEditFormProps) {
//   const [formData, setFormData] = useState({
//     orderNumber: order.orderNumber,
//     supplier: order.supplier,
//     status: order.status,
//     totalPrice: order.totalPrice,
//     currency: order.currency,
//     orderDate: formatDate(order.orderDate),
//     expectedDelivery: formatDate(order.expectedDelivery),
//     actualDelivery: formatDate(order.actualDelivery),
//     notes: order.notes || "",
//   });

//   const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
//   const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
//   const [newItem, setNewItem] = useState<OrderItemFormData>({
//     materialId: "",
//     quantity: 0,
//     unit: MeasurementUnit.KILOGRAM,
//     unitPrice: 0,
//   });

//   const { showToast } = useToast();
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const handleAddOrderItem = () => {
//     if (
//       !newItem.materialId ||
//       newItem.quantity <= 0 ||
//       newItem.unitPrice <= 0
//     ) {
//       showToast("Please fill in all order item fields", "error");
//       return;
//     }

//     setOrderItems([...orderItems, newItem]);
//     setNewItem({
//       materialId: "",
//       quantity: 0,
//       unit: MeasurementUnit.KILOGRAM,
//       unitPrice: 0,
//     });

//     // Update total price
//     const itemTotal = newItem.quantity * newItem.unitPrice;
//     setFormData((prev) => ({
//       ...prev,
//       totalPrice: prev.totalPrice + itemTotal,
//     }));
//   };

//   const handleRemoveOrderItem = (index: number) => {
//     const removedItem = orderItems[index];
//     const itemTotal = removedItem.quantity * removedItem.unitPrice;

//     setOrderItems(orderItems.filter((_, i) => i !== index));
//     setFormData((prev) => ({
//       ...prev,
//       totalPrice: prev.totalPrice - itemTotal,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);

//     try {
//       if (orderItems.length === 0) {
//         throw new Error("Please add at least one material to the order");
//       }

//       const processedData = {
//         ...formData,
//         totalPrice: parseFloat(formData.totalPrice.toString()),
//         orderDate: new Date(formData.orderDate),
//         expectedDelivery: new Date(formData.expectedDelivery),
//         actualDelivery: formData.actualDelivery
//           ? new Date(formData.actualDelivery)
//           : null,
//         orderItems: orderItems.map((item) => ({
//           ...item,
//           totalPrice: item.quantity * item.unitPrice,
//         })),
//       };

//       onSaveSuccess(processedData as MaterialOrder);
//       showToast(
//         `Order ${mode === "create" ? "created" : "updated"} successfully`,
//         "success"
//       );
//     } catch (error) {
//       showToast(
//         error instanceof Error ? error.message : "Failed to save order",
//         "error"
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!onDeleteSuccess) return;
//     setIsDeleting(true);
//     try {
//       await onDeleteSuccess(order.id);
//       showToast("Order deleted successfully", "success");
//       onCancel();
//     } catch (error) {
//       showToast(
//         error instanceof Error ? error.message : "Failed to delete order",
//         "error"
//       );
//     } finally {
//       setIsDeleting(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Existing form fields */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Order Number
//             </label>
//             <input
//               type="text"
//               value={formData.orderNumber}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   orderNumber: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Supplier
//             </label>
//             <input
//               type="text"
//               value={formData.supplier}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, supplier: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   status: e.target.value as OrderStatus,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             >
//               {Object.values(OrderStatus).map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Total Price
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 step="0.01"
//                 value={formData.totalPrice}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     totalPrice: parseFloat(e.target.value),
//                   }))
//                 }
//                 className="flex-1 px-3 py-2 border rounded-md"
//                 required
//               />
//               <input
//                 type="text"
//                 value={formData.currency}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, currency: e.target.value }))
//                 }
//                 className="w-20 px-3 py-2 border rounded-md"
//                 placeholder="USD"
//                 required
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Order Date
//             </label>
//             <input
//               type="date"
//               value={formData.orderDate}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Expected Delivery
//             </label>
//             <input
//               type="date"
//               value={formData.expectedDelivery}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   expectedDelivery: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2 col-span-2">
//             <label className="text-sm font-medium text-gray-700">
//               Actual Delivery
//             </label>
//             <input
//               type="date"
//               value={formData.actualDelivery}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   actualDelivery: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//             />
//           </div>

//           <div className="space-y-2 col-span-2">
//             <label className="text-sm font-medium text-gray-700">Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               rows={3}
//               className="w-full px-3 py-2 border rounded-md"
//             />
//           </div>
//         </div>

//         {/* Order Items Section */}
//         <div className="border-t pt-6">
//           <h3 className="text-lg font-semibold mb-4">Order Items</h3>

//           {/* Add new item form */}
//           <div className="grid grid-cols-4 gap-4 mb-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Material
//               </label>
//               <select
//                 value={newItem.materialId}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     materialId: e.target.value,
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//               >
//                 <option value="">Select Material</option>
//                 {availableMaterials.map((material) => (
//                   <option key={material.id} value={material.id}>
//                     {material.type} - {material.color}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 value={newItem.quantity}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     quantity: parseFloat(e.target.value),
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">Unit</label>
//               <select
//                 value={newItem.unit}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     unit: e.target.value as MeasurementUnit,
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//               >
//                 {Object.values(MeasurementUnit).map((unit) => (
//                   <option key={unit} value={unit}>
//                     {unit}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Unit Price
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   value={newItem.unitPrice}
//                   onChange={(e) =>
//                     setNewItem((prev) => ({
//                       ...prev,
//                       unitPrice: parseFloat(e.target.value),
//                     }))
//                   }
//                   className="w-full px-3 py-2 border rounded-md"
//                   min="0"
//                   step="0.01"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddOrderItem}
//                   className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Order items list */}
//           {orderItems.length > 0 && (
//             <div className="border rounded-md overflow-hidden">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Material
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Quantity
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Unit Price
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Total
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orderItems.map((item, index) => {
//                     const material = availableMaterials.find(
//                       (m) => m.id === item.materialId
//                     );
//                     return (
//                       <tr key={index} className="border-t">
//                         <td className="px-4 py-2">
//                           {material
//                             ? `${material.type} - ${material.color}`
//                             : "Unknown"}
//                         </td>
//                         <td className="px-4 py-2">
//                           {item.quantity} {item.unit}
//                         </td>
//                         <td className="px-4 py-2">
//                           {item.unitPrice} {formData.currency}
//                         </td>
//                         <td className="px-4 py-2">
//                           {(item.quantity * item.unitPrice).toFixed(2)}{" "}
//                           {formData.currency}
//                         </td>
//                         <td className="px-4 py-2">
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveOrderItem(index)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             Remove
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-between border-t pt-6">
//           {mode === "edit" && onDeleteSuccess && (
//             <button
//               type="button"
//               onClick={() => setShowDeleteConfirm(true)}
//               className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
//             >
//               Delete Order
//             </button>
//           )}
//           <div className="flex gap-3 ml-auto">
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSaving || orderItems.length === 0}
//               className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
//             >
//               {isSaving
//                 ? mode === "create"
//                   ? "Creating..."
//                   : "Saving..."
//                 : mode === "create"
//                 ? "Create Order"
//                 : "Save Changes"}
//             </button>
//           </div>
//         </div>
//       </form>

//       {mode === "edit" && onDeleteSuccess && (
//         <ConfirmDialog
//           open={showDeleteConfirm}
//           onOpenChange={setShowDeleteConfirm}
//           title="Delete Order"
//           description="Are you sure you want to delete this order? This action cannot be undone."
//           onConfirm={handleDelete}
//           onCancel={() => setShowDeleteConfirm(false)}
//           isLoading={isDeleting}
//         />
//       )}
//     </>
//   );
// }

// // "use client";

// // import { ConfirmDialog } from "@/components/ui/confirm-dialog";
// // import { useToast } from "@/components/ui/toast";
// // import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
// // import { useState } from "react";

// // interface MaterialOrderEditFormProps {
// //   order: MaterialOrder;
// //   onSaveSuccess: (updatedOrder: MaterialOrder) => void;
// //   onDeleteSuccess?: (orderId: string) => Promise<void>;
// //   onCancel: () => void;
// //   mode?: "edit" | "create";
// // }

// // // Helper function to safely format dates
// // const formatDate = (date: Date | string | null | undefined) => {
// //   if (!date) return "";
// //   const d = typeof date === "string" ? new Date(date) : date;
// //   return d instanceof Date && !isNaN(d.getTime())
// //     ? d.toISOString().split("T")[0]
// //     : "";
// // };

// // export function MaterialOrderEditForm({
// //   order,
// //   onSaveSuccess,
// //   onDeleteSuccess,
// //   onCancel,
// //   mode = "edit",
// // }: MaterialOrderEditFormProps) {

// //   const [formData, setFormData] = useState({
// //     orderNumber: order.orderNumber,
// //     supplier: order.supplier,
// //     status: order.status,
// //     totalPrice: order.totalPrice,
// //     currency: order.currency,
// //     orderDate: formatDate(order.orderDate),
// //     expectedDelivery: formatDate(order.expectedDelivery),
// //     actualDelivery: formatDate(order.actualDelivery),
// //     notes: order.notes || "",
// //   });

// //   const { showToast } = useToast();
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setIsSaving(true);
// //     try {
// //       const processedData = {
// //         ...formData,
// //         totalPrice: parseFloat(formData.totalPrice.toString()),
// //         orderDate: new Date(formData.orderDate),
// //         expectedDelivery: new Date(formData.expectedDelivery),
// //         actualDelivery: formData.actualDelivery
// //           ? new Date(formData.actualDelivery)
// //           : null,
// //       };

// //       onSaveSuccess(processedData as MaterialOrder);
// //       showToast(
// //         `Order ${mode === "create" ? "created" : "updated"} successfully`,
// //         "success"
// //       );
// //     } catch (error) {
// //       showToast(
// //         error instanceof Error ? error.message : "Failed to save order",
// //         "error"
// //       );
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     if (!onDeleteSuccess) return;
// //     setIsDeleting(true);
// //     try {
// //       await onDeleteSuccess(order.id);
// //       showToast("Order deleted successfully", "success");
// //       onCancel();
// //     } catch (error) {
// //       showToast(
// //         error instanceof Error ? error.message : "Failed to delete order",
// //         "error"
// //       );
// //     } finally {
// //       setIsDeleting(false);
// //       setShowDeleteConfirm(false);
// //     }
// //   };

// //   return (
// //     <>
// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Order Number
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.orderNumber}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   orderNumber: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Supplier
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.supplier}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, supplier: e.target.value }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">Status</label>
// //             <select
// //               value={formData.status}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   status: e.target.value as OrderStatus,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             >
// //               {Object.values(OrderStatus).map((status) => (
// //                 <option key={status} value={status}>
// //                   {status}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Total Price
// //             </label>
// //             <div className="flex gap-2">
// //               <input
// //                 type="number"
// //                 step="0.01"
// //                 value={formData.totalPrice}
// //                 onChange={(e) =>
// //                   setFormData((prev) => ({
// //                     ...prev,
// //                     totalPrice: parseFloat(e.target.value),
// //                   }))
// //                 }
// //                 className="flex-1 px-3 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 value={formData.currency}
// //                 onChange={(e) =>
// //                   setFormData((prev) => ({ ...prev, currency: e.target.value }))
// //                 }
// //                 className="w-20 px-3 py-2 border rounded-md"
// //                 placeholder="USD"
// //                 required
// //               />
// //             </div>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Order Date
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.orderDate}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Expected Delivery
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.expectedDelivery}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   expectedDelivery: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2 col-span-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Actual Delivery
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.actualDelivery}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   actualDelivery: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //             />
// //           </div>

// //           <div className="space-y-2 col-span-2">
// //             <label className="text-sm font-medium text-gray-700">Notes</label>
// //             <textarea
// //               value={formData.notes}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
// //               }
// //               rows={3}
// //               className="w-full px-3 py-2 border rounded-md"
// //             />
// //           </div>
// //         </div>

// //         <div className="flex justify-between border-t pt-6 mt-6">
// //           {mode === "edit" && onDeleteSuccess && (
// //             <button
// //               type="button"
// //               onClick={() => setShowDeleteConfirm(true)}
// //               className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
// //             >
// //               Delete Order
// //             </button>
// //           )}
// //           <div className="flex gap-3 ml-auto">
// //             <button
// //               type="button"
// //               onClick={onCancel}
// //               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               disabled={isSaving}
// //               className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
// //             >
// //               {isSaving
// //                 ? mode === "create"
// //                   ? "Creating..."
// //                   : "Saving..."
// //                 : mode === "create"
// //                 ? "Create Order"
// //                 : "Save Changes"}
// //             </button>
// //           </div>
// //         </div>
// //       </form>

// //       {mode === "edit" && onDeleteSuccess && (
// //         <ConfirmDialog
// //           open={showDeleteConfirm}
// //           onOpenChange={setShowDeleteConfirm}
// //           title="Delete Order"
// //           description="Are you sure you want to delete this order? This action cannot be undone."
// //           onConfirm={handleDelete}
// //           onCancel={() => setShowDeleteConfirm(false)}
// //           isLoading={isDeleting}
// //         />
// //       )}
// //     </>
// //   );
// // }
