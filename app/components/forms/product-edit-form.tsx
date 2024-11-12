"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductEditFormProps {
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function ProductEditForm({
  product,
  onSave,
  onDelete,
  onCancel,
}: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    sku: product.sku,
    piece: product.piece,
    name: product.name,
    season: product.season,
    phase: product.phase,
    notes: product.notes || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting product:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Piece</label>
            <input
              type="text"
              value={formData.piece}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, piece: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Season</label>
            <input
              type="text"
              value={formData.season}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, season: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Phase</label>
            <select
              value={formData.phase}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phase: e.target.value as Product["phase"],
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="SWATCH">Swatch</option>
              <option value="INITIAL_SAMPLE">Initial Sample</option>
              <option value="FIT_SAMPLE">Fit Sample</option>
              <option value="PRODUCTION_SAMPLE">Production Sample</option>
              <option value="PRODUCTION">Production</option>
            </select>
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
          {onDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Product
            </button>
          )}
          <div className="flex gap-3">
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
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {onDelete && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
