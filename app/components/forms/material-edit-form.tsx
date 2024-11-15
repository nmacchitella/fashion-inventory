"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Material, MeasurementUnit } from "@/types/material";
import { useState } from "react";

interface MaterialEditFormProps {
  material: Material;
  onSaveSuccess: (updatedMaterial: Material) => void;
  onDeleteSuccess?: (materialId: string) => Promise<void>; // Update type
  onCancel: () => void;
  mode?: "edit" | "create";
}

export function MaterialEditForm({
  material,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: MaterialEditFormProps) {
  const [formData, setFormData] = useState({
    type: material.type,
    color: material.color,
    colorCode: material.colorCode,
    brand: material.brand,
    quantity: material.quantity,
    unit: material.unit,
    costPerUnit: material.costPerUnit,
    currency: material.currency,
    location: material.location,
    notes: material.notes || "",
  });

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSaveSuccess(formData as Material);
      showToast(
        `Material ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save material",
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
      await onDeleteSuccess(material.id);
      showToast("Material deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete material",
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
            <label className="text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Color Code
            </label>
            <input
              type="text"
              value={formData.colorCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, colorCode: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unit: e.target.value as MeasurementUnit,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {Object.values(MeasurementUnit).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cost Per Unit
            </label>
            <input
              type="number"
              value={formData.costPerUnit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  costPerUnit: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
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

        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Material
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
                ? "Create Material"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Material"
          description="Are you sure you want to delete this material? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
