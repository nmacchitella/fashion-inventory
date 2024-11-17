"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductEditFormProps {
  product: Product;
  onSaveSuccess: (updatedProduct: Product) => void;
  onDeleteSuccess?: (productId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
}

export function ProductEditForm({
  product,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    sku: product.sku,
    piece: product.piece,
    name: product.name,
    season: product.season,
    phase: product.phase,
    notes: product.notes || "",
    photos: product.photos,
  });

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSaveSuccess(formData as Product);
      showToast(
        `Product ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save product",
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
      await onDeleteSuccess(product.id);
      showToast("Product deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete product",
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
            <label className="text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
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
              required
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
              required
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
              required
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
              required
            >
              <option value="SWATCH">Swatch</option>
              <option value="INITIAL_SAMPLE">Initial Sample</option>
              <option value="FIT_SAMPLE">Fit Sample</option>
              <option value="PRODUCTION_SAMPLE">Production Sample</option>
              <option value="PRODUCTION">Production</option>
            </select>
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
              Delete Product
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
                ? "Create Product"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
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
