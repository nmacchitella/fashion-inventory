import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DetailsItem {
  label: string;
  value: string | number;
  key: string;
}

interface DetailsViewProps {
  items: DetailsItem[];
  onSave?: (updatedData: Record<string, any>) => Promise<void>;
  apiEndpoint?: string;
  itemId?: string;
}

export function DetailsView({
  items,
  onSave,
  apiEndpoint,
  itemId,
}: DetailsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize edited values
    const initialValues: Record<string, any> = {};
    items.forEach((item) => {
      initialValues[item.key] = item.value;
    });
    setEditedValues(initialValues);
  }, [items]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    const initialValues: Record<string, any> = {};
    items.forEach((item) => {
      initialValues[item.key] = item.value;
    });
    setEditedValues(initialValues);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onSave && (!apiEndpoint || !itemId)) {
      console.error(
        "Either onSave callback or apiEndpoint+itemId must be provided"
      );
      return;
    }

    try {
      setIsLoading(true);

      if (onSave) {
        await onSave(editedValues);
      } else if (apiEndpoint && itemId) {
        console.log("trying to save");
        console.log("Sending data:", editedValues);

        const response = await fetch(`${apiEndpoint}/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedValues),
        });

        if (!response.ok) {
          throw new Error("Failed to update details");
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg border p-6 relative">
      <div className="absolute top-4 right-4">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Edit details"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              aria-label="Save details"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
            <dd className="text-sm text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={editedValues[item.key] ?? ""}
                  onChange={(e) => handleInputChange(item.key, e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isLoading}
                />
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailsView;
