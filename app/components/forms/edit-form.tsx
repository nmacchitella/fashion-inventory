"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface FormField<T> {
  key: keyof T | "properties";
  label: string;
  type: "text" | "number" | "select" | "textarea" | "keyValue";
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface EditFormProps<T> {
  mode?: "edit" | "create";
  initialData: T;
  fields: FormField<T>[];
  onSaveSuccess: (updatedData: T | Partial<T>) => void;
  onDeleteSuccess?: (id: string) => Promise<void>;
  onCancel: () => void;
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

  // State for dynamic properties
  const [properties, setProperties] = useState<
    { key: string; value: string }[]
  >(
    Object.entries((initialData as any).properties || {}).map(
      ([key, value]) => ({
        key,
        value: String(value),
      })
    )
  );

  const handleAddProperty = () => {
    setProperties([...properties, { key: "", value: "" }]);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handlePropertyChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...properties];
    updated[index][field] = value;
    setProperties(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Merge properties into formData
      const mergedData = {
        ...formData,
        properties: properties.reduce((acc, prop) => {
          if (prop.key.trim() !== "") {
            acc[prop.key] = {
              label: prop.key,
              value: prop.value,
              type: "string",
            };
          }
          return acc;
        }, {} as Record<string, any>),
      };

      await onSaveSuccess(mergedData);
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
          {fields.map((field) => {
            if (field.type === "keyValue") {
              return (
                <div key="properties" className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {properties.map((prop, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Key"
                        value={prop.key}
                        onChange={(e) =>
                          handlePropertyChange(index, "key", e.target.value)
                        }
                        className="w-1/3 px-3 py-2 border rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={prop.value}
                        onChange={(e) =>
                          handlePropertyChange(index, "value", e.target.value)
                        }
                        className="w-2/3 px-3 py-2 border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProperty(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddProperty}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Property
                  </button>
                </div>
              );
            }

            return (
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
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
            );
          })}
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
