import { EditForm } from "@/components/forms/edit-form";
import { DialogComponent } from "@/components/ui/dialog";

interface FormField<T> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

interface UpsertDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the item is successfully saved (POST or PATCH).
   * Receives the newly created/updated item.
   */
  onSuccess: (item: T) => void;
  /**
   * Called if the user chooses to delete the item (only in edit mode).
   * Typically expects you to handle the API call in the parent or pass
   * an ID to your own logic.
   */
  onDeleteSuccess: (item: T) => void;
  /**
   * Default data to pre-fill the form.
   * In edit mode, this would be the existing item data.
   */
  defaultData: Partial<T>;
  /** The fields to display in the form. */
  fields: FormField<T>[];
  /** The base API endpoint (e.g., "/api/products"). */
  apiEndpoint: string;
  /** For labeling in the dialog title, e.g. "Product". */
  itemName: string;
  /**
   * "create" => POST to `/api/...`
   * "edit" => PATCH to `/api/.../id`
   */
  mode: "create" | "edit";
}

export function UpsertDialog<T extends { id?: string }>({
  open,
  onOpenChange,
  onSuccess,
  onDeleteSuccess,
  defaultData,
  fields,
  apiEndpoint,
  itemName,
  mode,
}: UpsertDialogProps<T>) {
  // Handle saving (create or edit)
  const handleSave = async (data: Partial<T>) => {
    try {
      // Switch between POST (create) and PATCH (edit)
      const method = mode === "create" ? "POST" : "PATCH";
      // For edit mode, append the ID to the endpoint
      const url =
        mode === "create" ? apiEndpoint : `${apiEndpoint}/${(data as T).id}`;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Attempt to extract an error message
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message ||
            `Failed to ${mode === "create" ? "create" : "update"} ${itemName}`
        );
      }

      // Parse and pass the newly upserted item back up
      const upsertedItem = await response.json();
      onSuccess(upsertedItem);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error: Failed to ${mode} ${itemName}`, error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? `Add New ${itemName}` : `Edit ${itemName}`}
    >
      <EditForm
        mode={mode}
        initialData={defaultData}
        fields={fields}
        onSaveSuccess={handleSave}
        onDeleteSuccess={onDeleteSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </DialogComponent>
  );
}
