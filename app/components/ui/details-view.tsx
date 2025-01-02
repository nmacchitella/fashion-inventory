import { Check, Pencil, Plus, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DetailsItem {
  label: string;
  value: string | number | React.ReactNode;
  key: string;
  type?: string;
  editable?: boolean;
}

interface DetailsViewProps {
  items: DetailsItem[];
  onSave?: (updatedData: Record<string, any>) => Promise<void>;
  apiEndpoint?: string;
  itemId?: string;
  title: string;
  allowCustomFields?: boolean; // New prop to enable/disable custom fields feature
}

export function DetailsView({
  items,
  onSave,
  apiEndpoint,
  itemId,
  title,
  allowCustomFields = false, // Disabled by default for backward compatibility
}: DetailsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  useEffect(() => {
    // Initialize edited values with proper structure
    const initialValues: Record<string, any> = {};
    const initialCustomFields: Array<{ key: string; value: string }> = [];

    items.forEach((item) => {
      if (!item || !item.key) return;

      if (
        allowCustomFields &&
        typeof item.key === "string" &&
        item.key.startsWith("properties.")
      ) {
        const propertyKey = item.key.split(".")[1];
        initialCustomFields.push({
          key: propertyKey,
          value: String(item.value),
        });
      } else {
        initialValues[item.key] = item.value;
      }
    });

    setEditedValues(initialValues);
    setCustomFields(initialCustomFields);
  }, [items, allowCustomFields]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    const initialValues: Record<string, any> = {};
    const initialCustomFields: Array<{ key: string; value: string }> = [];

    items.forEach((item) => {
      if (!item || !item.key) return;

      if (
        allowCustomFields &&
        typeof item.key === "string" &&
        item.key.startsWith("properties.")
      ) {
        const propertyKey = item.key.split(".")[1];
        initialCustomFields.push({
          key: propertyKey,
          value: String(item.value),
        });
      } else {
        initialValues[item.key] = item.value;
      }
    });

    setEditedValues(initialValues);
    setCustomFields(initialCustomFields);
    setIsEditing(false);
    setShowNewFieldInput(false);
    setNewFieldName("");
  };

  const handleInputChange = (key: string, value: string) => {
    if (!key) return;

    if (allowCustomFields && key.startsWith("properties.")) {
      const propertyKey = key.split(".")[1];
      const fieldIndex = customFields.findIndex(
        (field) => field.key === propertyKey
      );

      if (fieldIndex !== -1) {
        const updatedFields = [...customFields];
        updatedFields[fieldIndex].value = value;
        setCustomFields(updatedFields);
      }
    } else {
      setEditedValues((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleAddNewField = () => {
    if (!newFieldName.trim()) return;

    setCustomFields((prev) => [
      ...prev,
      { key: newFieldName.trim(), value: "" },
    ]);
    setNewFieldName("");
    setShowNewFieldInput(false);
  };

  const handleRemoveCustomField = (keyToRemove: string) => {
    setCustomFields((prev) =>
      prev.filter((field) => field.key !== keyToRemove)
    );
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

      // Prepare the data for saving
      const dataToSave = {
        ...editedValues,
        ...(allowCustomFields && {
          properties: customFields.reduce(
            (acc, field) => ({
              ...acc,
              [field.key]: {
                label: field.key,
                value: field.value,
                type: "string",
              },
            }),
            {}
          ),
        }),
      };

      if (apiEndpoint && itemId) {
        const response = await fetch(`${apiEndpoint}/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error("Failed to update details");
        }

        const updatedData = await response.json();
        onSave?.(updatedData);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 relative">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

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
        {/* Standard fields */}
        {items
          .filter((item) => !item.key.startsWith("properties."))
          .map((item, index) => (
            <div key={index} className="space-y-1">
              <dt className="text-sm font-medium text-gray-500">
                {item.label}
              </dt>
              <dd className="text-sm text-gray-900">
                {isEditing && item.editable ? (
                  <input
                    type={item.type || "text"}
                    value={editedValues[item.key] ?? ""}
                    onChange={(e) =>
                      handleInputChange(item.key, e.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading}
                  />
                ) : (
                  editedValues[item.key]
                )}
              </dd>
            </div>
          ))}

        {/* Custom fields section - only shown if allowCustomFields is true */}
        {allowCustomFields && (
          <div className="col-span-2 border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Custom Properties</h3>
              {isEditing && (
                <button
                  onClick={() => setShowNewFieldInput(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" /> Add Field
                </button>
              )}
            </div>

            {/* New field input */}
            {isEditing && showNewFieldInput && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Enter field name"
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={handleAddNewField}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewFieldInput(false);
                    setNewFieldName("");
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Custom fields list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center justify-between">
                    {field.key}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveCustomField(field.key)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          handleInputChange(
                            `properties.${field.key}`,
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isLoading}
                      />
                    ) : (
                      field.value
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailsView;
