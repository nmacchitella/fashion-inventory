import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NotesProps<T extends { id?: string }> {
  initialNotes?: string | null;
  /**
   * Called when notes are successfully saved.
   * Receives the newly updated item.
   */
  onSuccess: (item: T) => void;
  /** The base API endpoint (e.g., "/api/products"). */
  apiEndpoint: string;
  /** The ID of the item being edited */
  itemId: string;
}

export function Notes<T extends { id?: string }>({
  initialNotes = "",
  onSuccess,
  apiEndpoint,
  itemId,
}: NotesProps<T>) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const url = `${apiEndpoint}/${itemId}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        // Attempt to extract an error message
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update notes");
      }

      // Parse and pass the updated item back up
      const updatedItem = await response.json();
      onSuccess(updatedItem);
      setIsEditing(false);
    } catch (error) {
      console.error("Error: Failed to update notes", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNotes(initialNotes ?? "");
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Notes</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Edit notes"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`min-h-24 w-full rounded-md border-gray-200 bg-white px-3 py-2 text-sm transition-colors
            ${
              !isEditing
                ? "cursor-default bg-gray-50 text-gray-600"
                : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }
            disabled:cursor-not-allowed disabled:opacity-50`}
          placeholder="Enter your notes..."
          disabled={isLoading || !isEditing}
          aria-label="Notes content"
        />

        {isEditing && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Save notes"
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cancel editing"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
