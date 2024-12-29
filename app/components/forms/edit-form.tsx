"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface EditFormProps<T> {
  mode?: "edit" | "create";
  initialData: T;
  fields: FormField<T>[];
  onSaveSuccess: (updatedData: T | Partial<T>) => void;
  onDeleteSuccess?: (id: string) => Promise<void>;
  onCancel: () => void;
}

interface FormField<T> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

export function EditForm<T extends { id?: string }>({
  mode = "edit",
  initialData,
  fields,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
}: EditFormProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // We'll rely on the parent to do the actual API call
      // onSaveSuccess can return the newly created/updated item
      await onSaveSuccess(formData);
      showToast(
        `Item ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save item",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess || !formData.id) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(formData.id);
      showToast("Item deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete item",
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
          {fields.map((field) => (
            <div key={String(field.key)} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={String(formData[field.key] || "")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={String(formData[field.key] || "")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  value={String(formData[field.key] || "")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && formData.id && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Item
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
                ? "Create Item"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Confirm delete */}
      {mode === "edit" && onDeleteSuccess && formData.id && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
